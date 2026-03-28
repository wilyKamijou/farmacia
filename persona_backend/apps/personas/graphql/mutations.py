# apps/personas/graphql/mutations.py
import graphene
import pyotp
from django.contrib.auth import authenticate
from django.contrib.auth import login as django_login
from django.contrib.auth import logout as django_logout
from .types import ClienteType, EmpleadoType, VentaType, CategoriaType, ProductoType, AlmacenType, ProductoAlmacenType, DetalleVentaType
from apps.personas.models import Cliente, Empleado, Venta, Categoria, Producto, Almacen, ProductoAlmacen, DetalleVenta


# ==================== MUTACIONES DE AUTENTICACIÓN ====================

class LoginMutation(graphene.Mutation):
    class Arguments:
        email = graphene.String(required=True)
        password = graphene.String(required=True)
    
    success = graphene.Boolean()
    message = graphene.String()
    requires_2fa = graphene.Boolean()
    user_id = graphene.ID()
    email = graphene.String()
    
    def mutate(self, info, email, password):
        user = authenticate(username=email, password=password)
        
        if user is None:
            return LoginMutation(
                success=False,
                message="Credenciales inválidas",
                requires_2fa=False
            )
        
        if hasattr(user, 'is_2fa_enabled') and user.is_2fa_enabled:
            django_login(info.context, user)
            return LoginMutation(
                success=False,
                message="Se requiere código 2FA",
                requires_2fa=True,
                user_id=user.id,
                email=user.email
            )
        
        django_login(info.context, user)
        return LoginMutation(
            success=True,
            message="Login exitoso",
            requires_2fa=False,
            user_id=user.id,
            email=user.email
        )


class VerifyOTPMutation(graphene.Mutation):
    class Arguments:
        user_id = graphene.ID(required=True)
        otp_code = graphene.String(required=True)
    
    success = graphene.Boolean()
    message = graphene.String()
    token = graphene.String()
    
    def mutate(self, info, user_id, otp_code):
        try:
            user = Empleado.objects.get(id=user_id)
            
            if user.verify_otp(otp_code):
                return VerifyOTPMutation(
                    success=True,
                    message="2FA verificado correctamente",
                    token="temp-jwt-token"
                )
            else:
                return VerifyOTPMutation(
                    success=False,
                    message="Código OTP inválido"
                )
        except Empleado.DoesNotExist:
            return VerifyOTPMutation(
                success=False,
                message="Usuario no encontrado"
            )


class Enable2FAMutation(graphene.Mutation):
    class Arguments:
        password = graphene.String(required=True)
    
    success = graphene.Boolean()
    message = graphene.String()
    qr_code_url = graphene.String()
    secret = graphene.String()
    
    def mutate(self, info, password):
        user = info.context.user
        
        if not user.is_authenticated:
            return Enable2FAMutation(
                success=False,
                message="No autenticado. Por favor inicia sesión primero."
            )
        
        if not user.check_password(password):
            return Enable2FAMutation(
                success=False,
                message="Contraseña incorrecta"
            )
        
        secret = user.generate_otp_secret()
        uri = user.get_otp_provisioning_uri()
        
        user.is_2fa_enabled = True
        user.save()
        
        return Enable2FAMutation(
            success=True,
            message="2FA habilitado correctamente",
            qr_code_url=uri,
            secret=secret
        )


class LogoutMutation(graphene.Mutation):
    success = graphene.Boolean()
    message = graphene.String()
    
    def mutate(self, info):
        django_logout(info.context)
        return LogoutMutation(success=True, message="Sesión cerrada")


# ==================== MUTACIONES CRUD CLIENTE ====================

class CrearCliente(graphene.Mutation):
    class Arguments:
        nombre = graphene.String(required=True)
        apellido = graphene.String(required=True)
        telefono = graphene.String()
    
    cliente = graphene.Field(ClienteType)
    ok = graphene.Boolean()
    mensaje = graphene.String()
    
    def mutate(self, info, nombre, apellido, telefono=None):
        try:
            cliente = Cliente(
                nombre=nombre,
                apellido=apellido,
                telefono=telefono
            )
            cliente.save()
            return CrearCliente(
                cliente=cliente,
                ok=True,
                mensaje=f"Cliente {nombre} {apellido} creado correctamente"
            )
        except Exception as e:
            return CrearCliente(
                cliente=None,
                ok=False,
                mensaje=f"Error al crear cliente: {str(e)}"
            )


class ActualizarCliente(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)
        nombre = graphene.String()
        apellido = graphene.String()
        telefono = graphene.String()
    
    cliente = graphene.Field(ClienteType)
    ok = graphene.Boolean()
    mensaje = graphene.String()
    
    def mutate(self, info, id, **kwargs):
        try:
            cliente = Cliente.objects.get(pk=id)
            for key, value in kwargs.items():
                if value is not None:
                    setattr(cliente, key, value)
            cliente.save()
            return ActualizarCliente(
                cliente=cliente,
                ok=True,
                mensaje="Cliente actualizado correctamente"
            )
        except Cliente.DoesNotExist:
            return ActualizarCliente(
                cliente=None,
                ok=False,
                mensaje="Cliente no encontrado"
            )


class EliminarCliente(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)
    
    ok = graphene.Boolean()
    mensaje = graphene.String()
    
    def mutate(self, info, id):
        try:
            cliente = Cliente.objects.get(pk=id)
            nombre_completo = f"{cliente.nombre} {cliente.apellido}"
            cliente.delete()
            return EliminarCliente(
                ok=True,
                mensaje=f"Cliente {nombre_completo} eliminado correctamente"
            )
        except Cliente.DoesNotExist:
            return EliminarCliente(
                ok=False,
                mensaje="Cliente no encontrado"
            )


# ==================== MUTACIONES CRUD EMPLEADO ====================

class CrearEmpleado(graphene.Mutation):
    class Arguments:
        username = graphene.String(required=True)
        email = graphene.String(required=True)
        password = graphene.String(required=True)
        first_name = graphene.String()
        last_name = graphene.String()
        telefono_em = graphene.String()
        direccion_em = graphene.String()
        sueldo_em = graphene.Decimal()
        activo = graphene.Boolean()
    
    empleado = graphene.Field(EmpleadoType)
    ok = graphene.Boolean()
    mensaje = graphene.String()
    
    def mutate(self, info, username, email, password, first_name="", last_name="",
               telefono_em=None, direccion_em=None, sueldo_em=None, activo=True):
        try:
            empleado = Empleado(
                username=username,
                email=email,
                first_name=first_name,
                last_name=last_name,
                telefono_em=telefono_em,
                direccion_em=direccion_em,
                sueldo_em=sueldo_em,
                activo=activo
            )
            empleado.set_password(password)
            empleado.save()
            return CrearEmpleado(
                empleado=empleado,
                ok=True,
                mensaje=f"Empleado {first_name} {last_name} creado correctamente"
            )
        except Exception as e:
            return CrearEmpleado(
                empleado=None,
                ok=False,
                mensaje=f"Error al crear empleado: {str(e)}"
            )


class ActualizarEmpleado(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)
        username = graphene.String()
        email = graphene.String()
        first_name = graphene.String()
        last_name = graphene.String()
        telefono_em = graphene.String()
        direccion_em = graphene.String()
        sueldo_em = graphene.Decimal()
        activo = graphene.Boolean()
    
    empleado = graphene.Field(EmpleadoType)
    ok = graphene.Boolean()
    mensaje = graphene.String()
    
    def mutate(self, info, id, **kwargs):
        try:
            empleado = Empleado.objects.get(pk=id)
            for key, value in kwargs.items():
                if value is not None and key != 'password':
                    setattr(empleado, key, value)
            empleado.save()
            return ActualizarEmpleado(
                empleado=empleado,
                ok=True,
                mensaje="Empleado actualizado correctamente"
            )
        except Empleado.DoesNotExist:
            return ActualizarEmpleado(
                empleado=None,
                ok=False,
                mensaje="Empleado no encontrado"
            )


class EliminarEmpleado(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)
    
    ok = graphene.Boolean()
    mensaje = graphene.String()
    
    def mutate(self, info, id):
        try:
            empleado = Empleado.objects.get(pk=id)
            nombre_completo = f"{empleado.first_name} {empleado.last_name}"
            empleado.delete()
            return EliminarEmpleado(
                ok=True,
                mensaje=f"Empleado {nombre_completo} eliminado correctamente"
            )
        except Empleado.DoesNotExist:
            return EliminarEmpleado(
                ok=False,
                mensaje="Empleado no encontrado"
            )


# ==================== MUTACIONES CRUD VENTA ====================

class CrearVenta(graphene.Mutation):
    class Arguments:
        cliente_id = graphene.ID(required=True)
        empleado_id = graphene.ID(required=True)
        monto_total_ve = graphene.Decimal(required=True)
        descripcion = graphene.String()
    
    venta = graphene.Field(VentaType)
    ok = graphene.Boolean()
    mensaje = graphene.String()
    
    def mutate(self, info, cliente_id, empleado_id, monto_total_ve, descripcion=None):
        try:
            cliente = Cliente.objects.get(pk=cliente_id)
            empleado = Empleado.objects.get(pk=empleado_id)
            
            venta = Venta(
                cliente=cliente,
                empleado=empleado,
                monto_total_ve=monto_total_ve,
                descripcion=descripcion
            )
            venta.save()
            return CrearVenta(
                venta=venta,
                ok=True,
                mensaje=f"Venta #{venta.id} creada correctamente"
            )
        except Cliente.DoesNotExist:
            return CrearVenta(
                venta=None,
                ok=False,
                mensaje="Cliente no encontrado"
            )
        except Empleado.DoesNotExist:
            return CrearVenta(
                venta=None,
                ok=False,
                mensaje="Empleado no encontrado"
            )
        except Exception as e:
            return CrearVenta(
                venta=None,
                ok=False,
                mensaje=f"Error al crear venta: {str(e)}"
            )


class ActualizarVenta(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)
        monto_total_ve = graphene.Decimal()
        descripcion = graphene.String()
        cliente_id = graphene.ID()
        empleado_id = graphene.ID()
    
    venta = graphene.Field(VentaType)
    ok = graphene.Boolean()
    mensaje = graphene.String()
    
    def mutate(self, info, id, **kwargs):
        try:
            venta = Venta.objects.get(pk=id)
            
            if 'cliente_id' in kwargs and kwargs['cliente_id'] is not None:
                cliente = Cliente.objects.get(pk=kwargs['cliente_id'])
                venta.cliente = cliente
            
            if 'empleado_id' in kwargs and kwargs['empleado_id'] is not None:
                empleado = Empleado.objects.get(pk=kwargs['empleado_id'])
                venta.empleado = empleado
            
            for key in ['monto_total_ve', 'descripcion']:
                if key in kwargs and kwargs[key] is not None:
                    setattr(venta, key, kwargs[key])
            
            venta.save()
            return ActualizarVenta(
                venta=venta,
                ok=True,
                mensaje="Venta actualizada correctamente"
            )
        except Venta.DoesNotExist:
            return ActualizarVenta(
                venta=None,
                ok=False,
                mensaje="Venta no encontrada"
            )
        except Cliente.DoesNotExist:
            return ActualizarVenta(
                venta=None,
                ok=False,
                mensaje="Cliente no encontrado"
            )
        except Empleado.DoesNotExist:
            return ActualizarVenta(
                venta=None,
                ok=False,
                mensaje="Empleado no encontrado"
            )


class EliminarVenta(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)
    
    ok = graphene.Boolean()
    mensaje = graphene.String()
    
    def mutate(self, info, id):
        try:
            venta = Venta.objects.get(pk=id)
            venta_id = venta.id
            venta.delete()
            return EliminarVenta(
                ok=True,
                mensaje=f"Venta #{venta_id} eliminada correctamente"
            )
        except Venta.DoesNotExist:
            return EliminarVenta(
                ok=False,
                mensaje="Venta no encontrada"
            )


# ==================== MUTACIONES CRUD CATEGORIA ====================

class CrearCategoria(graphene.Mutation):
    class Arguments:
        nombre_ct = graphene.String(required=True)
        descripcion_ct = graphene.String()
    
    categoria = graphene.Field(CategoriaType)
    ok = graphene.Boolean()
    mensaje = graphene.String()
    
    def mutate(self, info, nombre_ct, descripcion_ct=None):
        try:
            categoria = Categoria(
                nombre_ct=nombre_ct,
                descripcion_ct=descripcion_ct
            )
            categoria.save()
            return CrearCategoria(
                categoria=categoria,
                ok=True,
                mensaje=f"Categoría {nombre_ct} creada correctamente"
            )
        except Exception as e:
            return CrearCategoria(
                categoria=None,
                ok=False,
                mensaje=f"Error al crear categoría: {str(e)}"
            )


class ActualizarCategoria(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)
        nombre_ct = graphene.String()
        descripcion_ct = graphene.String()
    
    categoria = graphene.Field(CategoriaType)
    ok = graphene.Boolean()
    mensaje = graphene.String()
    
    def mutate(self, info, id, **kwargs):
        try:
            categoria = Categoria.objects.get(pk=id)
            for key, value in kwargs.items():
                if value is not None:
                    setattr(categoria, key, value)
            categoria.save()
            return ActualizarCategoria(
                categoria=categoria,
                ok=True,
                mensaje="Categoría actualizada correctamente"
            )
        except Categoria.DoesNotExist:
            return ActualizarCategoria(
                categoria=None,
                ok=False,
                mensaje="Categoría no encontrada"
            )


class EliminarCategoria(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)
    
    ok = graphene.Boolean()
    mensaje = graphene.String()
    
    def mutate(self, info, id):
        try:
            categoria = Categoria.objects.get(pk=id)
            nombre = categoria.nombre_ct
            categoria.delete()
            return EliminarCategoria(
                ok=True,
                mensaje=f"Categoría {nombre} eliminada correctamente"
            )
        except Categoria.DoesNotExist:
            return EliminarCategoria(
                ok=False,
                mensaje="Categoría no encontrada"
            )


# ==================== MUTACIONES CRUD PRODUCTO ====================

class CrearProducto(graphene.Mutation):
    class Arguments:
        nombre_pr = graphene.String(required=True)
        nombre_tc = graphene.String(required=True)
        fecha_fab = graphene.Date(required=True)
        fecha_venc = graphene.Date(required=True)
        descripcion_pr = graphene.String()
        concentracion_qm = graphene.String()
        composicion_qm = graphene.String()
        categoria_id = graphene.ID(required=True)
        precio = graphene.Float(required=True)

    producto = graphene.Field(ProductoType)
    ok = graphene.Boolean()
    mensaje = graphene.String()

    def mutate(self, info, nombre_pr, nombre_tc, fecha_fab, fecha_venc,
               categoria_id, precio, descripcion_pr=None, concentracion_qm=None, composicion_qm=None):
        try:
            # 👈 LOGS PARA DEPURACIÓN
            print("=== DATOS RECIBIDOS EN BACKEND ===")
            print(f"nombre_pr: {nombre_pr}")
            print(f"nombre_tc: {nombre_tc}")
            print(f"fecha_fab: {fecha_fab}")
            print(f"fecha_venc: {fecha_venc}")
            print(f"categoria_id: {categoria_id}")
            print(f"precio: {precio} (tipo: {type(precio)})")
            print(f"descripcion_pr: {descripcion_pr}")
            print(f"concentracion_qm: {concentracion_qm}")
            print(f"composicion_qm: {composicion_qm}")
            
            categoria = Categoria.objects.get(pk=categoria_id)
            
            # 👈 VERIFICAR EL PRECIO ANTES DE CREAR
            print(f"Precio antes de crear producto: {precio}")
            
            producto = Producto(
                nombre_pr=nombre_pr,
                nombre_tc=nombre_tc,
                fecha_fab=fecha_fab,
                fecha_venc=fecha_venc,
                descripcion_pr=descripcion_pr,
                concentracion_qm=concentracion_qm,
                composicion_qm=composicion_qm,
                categoria=categoria,
                precio=precio
            )
            producto.save()
            return CrearProducto(
                producto=producto,
                ok=True,
                mensaje=f"Producto {nombre_pr} creado correctamente"
            )
        except Categoria.DoesNotExist:
            return CrearProducto(
                producto=None,
                ok=False,
                mensaje="Categoría no encontrada"
            )
        except Exception as e:
            print(f"❌ ERROR EN BACKEND: {e}")
            print(f"Tipo de error: {type(e)}")
            import traceback
            traceback.print_exc()
            return CrearProducto(
                producto=None,
                ok=False,
                mensaje=f"Error al crear producto: {str(e)}"
            )


class ActualizarProducto(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)
        nombre_pr = graphene.String()
        nombre_tc = graphene.String()
        fecha_fab = graphene.Date()
        fecha_venc = graphene.Date()
        descripcion_pr = graphene.String()
        concentracion_qm = graphene.String()
        composicion_qm = graphene.String()
        categoria_id = graphene.ID()
        precio = graphene.Float()  # 👈 Agregar precio como argumento opcional
    
    producto = graphene.Field(ProductoType)
    ok = graphene.Boolean()
    mensaje = graphene.String()
    
    def mutate(self, info, id, **kwargs):
        try:
            producto = Producto.objects.get(pk=id)
            
            if 'categoria_id' in kwargs and kwargs['categoria_id'] is not None:
                categoria = Categoria.objects.get(pk=kwargs['categoria_id'])
                producto.categoria = categoria
            
            campos_permitidos = ['nombre_pr', 'nombre_tc', 'fecha_fab', 'fecha_venc',
                                 'descripcion_pr', 'concentracion_qm', 'composicion_qm', 'precio']
            for key in campos_permitidos:
                if key in kwargs and kwargs[key] is not None:
                    setattr(producto, key, kwargs[key])
            
            producto.save()
            return ActualizarProducto(
                producto=producto,
                ok=True,
                mensaje="Producto actualizado correctamente"
            )
        except Producto.DoesNotExist:
            return ActualizarProducto(
                producto=None,
                ok=False,
                mensaje="Producto no encontrado"
            )
        except Categoria.DoesNotExist:
            return ActualizarProducto(
                producto=None,
                ok=False,
                mensaje="Categoría no encontrada"
            )


class EliminarProducto(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)
    
    ok = graphene.Boolean()
    mensaje = graphene.String()
    
    def mutate(self, info, id):
        try:
            producto = Producto.objects.get(pk=id)
            nombre = producto.nombre_pr
            producto.delete()
            return EliminarProducto(
                ok=True,
                mensaje=f"Producto {nombre} eliminado correctamente"
            )
        except Producto.DoesNotExist:
            return EliminarProducto(
                ok=False,
                mensaje="Producto no encontrado"
            )


# ==================== MUTACIONES CRUD ALMACEN ====================

class CrearAlmacen(graphene.Mutation):
    class Arguments:
        nombre_am = graphene.String(required=True)
        descripcion_am = graphene.String()
        direccion_am = graphene.String(required=True)
    
    almacen = graphene.Field(AlmacenType)
    ok = graphene.Boolean()
    mensaje = graphene.String()
    
    def mutate(self, info, nombre_am, direccion_am, descripcion_am=None):
        try:
            almacen = Almacen(
                nombre_am=nombre_am,
                descripcion_am=descripcion_am,
                direccion_am=direccion_am
            )
            almacen.save()
            return CrearAlmacen(
                almacen=almacen,
                ok=True,
                mensaje=f"Almacén {nombre_am} creado correctamente"
            )
        except Exception as e:
            return CrearAlmacen(
                almacen=None,
                ok=False,
                mensaje=f"Error al crear almacén: {str(e)}"
            )


class ActualizarAlmacen(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)
        nombre_am = graphene.String()
        descripcion_am = graphene.String()
        direccion_am = graphene.String()
    
    almacen = graphene.Field(AlmacenType)
    ok = graphene.Boolean()
    mensaje = graphene.String()
    
    def mutate(self, info, id, **kwargs):
        try:
            almacen = Almacen.objects.get(pk=id)
            for key, value in kwargs.items():
                if value is not None:
                    setattr(almacen, key, value)
            almacen.save()
            return ActualizarAlmacen(
                almacen=almacen,
                ok=True,
                mensaje="Almacén actualizado correctamente"
            )
        except Almacen.DoesNotExist:
            return ActualizarAlmacen(
                almacen=None,
                ok=False,
                mensaje="Almacén no encontrado"
            )


class EliminarAlmacen(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)
    
    ok = graphene.Boolean()
    mensaje = graphene.String()
    
    def mutate(self, info, id):
        try:
            almacen = Almacen.objects.get(pk=id)
            nombre = almacen.nombre_am
            almacen.delete()
            return EliminarAlmacen(
                ok=True,
                mensaje=f"Almacén {nombre} eliminado correctamente"
            )
        except Almacen.DoesNotExist:
            return EliminarAlmacen(
                ok=False,
                mensaje="Almacén no encontrado"
            )


# ==================== MUTACIONES CRUD PRODUCTO ALMACEN ====================

class CrearProductoAlmacen(graphene.Mutation):
    class Arguments:
        producto_id = graphene.ID(required=True)
        almacen_id = graphene.ID(required=True)
        stock = graphene.Int(required=True)
    
    producto_almacen = graphene.Field(ProductoAlmacenType)
    ok = graphene.Boolean()
    mensaje = graphene.String()
    
    def mutate(self, info, producto_id, almacen_id, stock):
        try:
            producto = Producto.objects.get(pk=producto_id)
            almacen = Almacen.objects.get(pk=almacen_id)
            
            producto_almacen, created = ProductoAlmacen.objects.get_or_create(
                producto=producto,
                almacen=almacen,
                defaults={'stock': stock}
            )
            
            if not created:
                return CrearProductoAlmacen(
                    producto_almacen=None,
                    ok=False,
                    mensaje="Este producto ya existe en este almacén"
                )
            
            return CrearProductoAlmacen(
                producto_almacen=producto_almacen,
                ok=True,
                mensaje=f"Producto {producto.nombre_pr} agregado al almacén con stock {stock}"
            )
        except Producto.DoesNotExist:
            return CrearProductoAlmacen(
                producto_almacen=None,
                ok=False,
                mensaje="Producto no encontrado"
            )
        except Almacen.DoesNotExist:
            return CrearProductoAlmacen(
                producto_almacen=None,
                ok=False,
                mensaje="Almacén no encontrado"
            )
        except Exception as e:
            return CrearProductoAlmacen(
                producto_almacen=None,
                ok=False,
                mensaje=f"Error al crear: {str(e)}"
            )


class ActualizarProductoAlmacen(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)
        stock = graphene.Int()
    
    producto_almacen = graphene.Field(ProductoAlmacenType)
    ok = graphene.Boolean()
    mensaje = graphene.String()
    
    def mutate(self, info, id, stock=None):
        try:
            producto_almacen = ProductoAlmacen.objects.get(pk=id)
            
            if stock is not None:
                producto_almacen.stock = stock
            
            producto_almacen.save()
            return ActualizarProductoAlmacen(
                producto_almacen=producto_almacen,
                ok=True,
                mensaje="Stock actualizado correctamente"
            )
        except ProductoAlmacen.DoesNotExist:
            return ActualizarProductoAlmacen(
                producto_almacen=None,
                ok=False,
                mensaje="Registro no encontrado"
            )


class EliminarProductoAlmacen(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)
    
    ok = graphene.Boolean()
    mensaje = graphene.String()
    
    def mutate(self, info, id):
        try:
            producto_almacen = ProductoAlmacen.objects.get(pk=id)
            producto_almacen.delete()
            return EliminarProductoAlmacen(
                ok=True,
                mensaje="Registro de producto-almacén eliminado correctamente"
            )
        except ProductoAlmacen.DoesNotExist:
            return EliminarProductoAlmacen(
                ok=False,
                mensaje="Registro no encontrado"
            )


# ==================== MUTACIONES CRUD DETALLE VENTA ====================

class CrearDetalleVenta(graphene.Mutation):
    class Arguments:
        venta_id = graphene.ID(required=True)
        producto_id = graphene.ID(required=True)
        almacen_id = graphene.ID(required=True)
        cantidad_dv = graphene.Int(required=True)
        precio_dv = graphene.Decimal(required=True)
    
    detalle_venta = graphene.Field(DetalleVentaType)
    ok = graphene.Boolean()
    mensaje = graphene.String()
    
    def mutate(self, info, venta_id, producto_id, almacen_id, cantidad_dv, precio_dv):
        try:
            venta = Venta.objects.get(pk=venta_id)
            producto = Producto.objects.get(pk=producto_id)
            almacen = Almacen.objects.get(pk=almacen_id)
            
            detalle_venta, created = DetalleVenta.objects.get_or_create(
                venta=venta,
                producto=producto,
                almacen=almacen,
                defaults={
                    'cantidad_dv': cantidad_dv,
                    'precio_dv': precio_dv
                }
            )
            
            if not created:
                return CrearDetalleVenta(
                    detalle_venta=None,
                    ok=False,
                    mensaje="Este detalle ya existe en esta venta"
                )
            
            return CrearDetalleVenta(
                detalle_venta=detalle_venta,
                ok=True,
                mensaje=f"Detalle de venta creado: {producto.nombre_pr} x{cantidad_dv}"
            )
        except Venta.DoesNotExist:
            return CrearDetalleVenta(
                detalle_venta=None,
                ok=False,
                mensaje="Venta no encontrada"
            )
        except Producto.DoesNotExist:
            return CrearDetalleVenta(
                detalle_venta=None,
                ok=False,
                mensaje="Producto no encontrado"
            )
        except Almacen.DoesNotExist:
            return CrearDetalleVenta(
                detalle_venta=None,
                ok=False,
                mensaje="Almacén no encontrado"
            )
        except Exception as e:
            return CrearDetalleVenta(
                detalle_venta=None,
                ok=False,
                mensaje=f"Error al crear detalle: {str(e)}"
            )


class ActualizarDetalleVenta(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)
        cantidad_dv = graphene.Int()
        precio_dv = graphene.Decimal()
    
    detalle_venta = graphene.Field(DetalleVentaType)
    ok = graphene.Boolean()
    mensaje = graphene.String()
    
    def mutate(self, info, id, cantidad_dv=None, precio_dv=None):
        try:
            detalle_venta = DetalleVenta.objects.get(pk=id)
            
            if cantidad_dv is not None:
                detalle_venta.cantidad_dv = cantidad_dv
            if precio_dv is not None:
                detalle_venta.precio_dv = precio_dv
            
            detalle_venta.save()
            return ActualizarDetalleVenta(
                detalle_venta=detalle_venta,
                ok=True,
                mensaje="Detalle de venta actualizado correctamente"
            )
        except DetalleVenta.DoesNotExist:
            return ActualizarDetalleVenta(
                detalle_venta=None,
                ok=False,
                mensaje="Detalle de venta no encontrado"
            )


class EliminarDetalleVenta(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)
    
    ok = graphene.Boolean()
    mensaje = graphene.String()
    
    def mutate(self, info, id):
        try:
            detalle_venta = DetalleVenta.objects.get(pk=id)
            detalle_venta.delete()
            return EliminarDetalleVenta(
                ok=True,
                mensaje="Detalle de venta eliminado correctamente"
            )
        except DetalleVenta.DoesNotExist:
            return EliminarDetalleVenta(
                ok=False,
                mensaje="Detalle de venta no encontrado"
            )


# ==================== MUTATION PRINCIPAL ====================

class Mutation(graphene.ObjectType):
    # Autenticación
    login = LoginMutation.Field()
    verify_otp = VerifyOTPMutation.Field()
    enable_2fa = Enable2FAMutation.Field()
    logout = LogoutMutation.Field()
    
    # CRUD Cliente
    crear_cliente = CrearCliente.Field()
    actualizar_cliente = ActualizarCliente.Field()
    eliminar_cliente = EliminarCliente.Field()
    
    # CRUD Empleado
    crear_empleado = CrearEmpleado.Field()
    actualizar_empleado = ActualizarEmpleado.Field()
    eliminar_empleado = EliminarEmpleado.Field()
    
    # CRUD Venta
    crear_venta = CrearVenta.Field()
    actualizar_venta = ActualizarVenta.Field()
    eliminar_venta = EliminarVenta.Field()
    
    # CRUD Categoria
    crear_categoria = CrearCategoria.Field()
    actualizar_categoria = ActualizarCategoria.Field()
    eliminar_categoria = EliminarCategoria.Field()
    
    # CRUD Producto
    crear_producto = CrearProducto.Field()
    actualizar_producto = ActualizarProducto.Field()
    eliminar_producto = EliminarProducto.Field()
    
    # CRUD Almacen
    crear_almacen = CrearAlmacen.Field()
    actualizar_almacen = ActualizarAlmacen.Field()
    eliminar_almacen = EliminarAlmacen.Field()
    
    # CRUD ProductoAlmacen
    crear_producto_almacen = CrearProductoAlmacen.Field()
    actualizar_producto_almacen = ActualizarProductoAlmacen.Field()
    eliminar_producto_almacen = EliminarProductoAlmacen.Field()
    
    # CRUD DetalleVenta
    crear_detalle_venta = CrearDetalleVenta.Field()
    actualizar_detalle_venta = ActualizarDetalleVenta.Field()
    eliminar_detalle_venta = EliminarDetalleVenta.Field()