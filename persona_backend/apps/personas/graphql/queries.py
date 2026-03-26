# apps/personas/graphql/queries.py
import graphene
from graphql import GraphQLError
from .types import (
    ClienteType, EmpleadoType, VentaType, CategoriaType, ProductoType, 
    AlmacenType, ProductoAlmacenType, DetalleVentaType,
    ProductoProximoVencerType, ResumenInventarioType, TotalesUsuariosType,
    ReporteCompletoType, AlmacenStockType, VentasMesType, FechaMayorVentaType,
    ReporteVentasType
)
from apps.personas.models import Cliente, Empleado, Venta, Categoria, Producto, Almacen, ProductoAlmacen, DetalleVenta
from apps.personas.services.reporte_service import ReporteService


class Query(graphene.ObjectType):
    """Query principal con CRUD y Reportes"""

    # ==================== QUERIES CLIENTE ====================
    all_clientes = graphene.List(ClienteType)
    cliente = graphene.Field(ClienteType, id=graphene.ID(required=True))
    
    # ==================== QUERIES EMPLEADO ====================
    all_empleados = graphene.List(EmpleadoType)
    empleado = graphene.Field(EmpleadoType, id=graphene.ID(required=True))
    empleados_activos = graphene.List(EmpleadoType)
    me = graphene.Field(EmpleadoType)
    
    # ==================== QUERIES VENTA ====================
    all_ventas = graphene.List(VentaType)
    venta = graphene.Field(VentaType, id=graphene.ID(required=True))
    ventas_por_cliente = graphene.List(VentaType, cliente_id=graphene.ID(required=True))
    ventas_por_empleado = graphene.List(VentaType, empleado_id=graphene.ID(required=True))
    
    # ==================== QUERIES CATEGORIA ====================
    all_categorias = graphene.List(CategoriaType)
    categoria = graphene.Field(CategoriaType, id=graphene.ID(required=True))
    
    # ==================== QUERIES PRODUCTO ====================
    all_productos = graphene.List(ProductoType)
    producto = graphene.Field(ProductoType, id=graphene.ID(required=True))
    productos_por_categoria = graphene.List(ProductoType, categoria_id=graphene.ID(required=True))
    
    # ==================== QUERIES ALMACEN ====================
    all_almacenes = graphene.List(AlmacenType)
    almacen = graphene.Field(AlmacenType, id=graphene.ID(required=True))
    
    # ==================== QUERIES PRODUCTO ALMACEN ====================
    all_productos_almacen = graphene.List(ProductoAlmacenType)
    producto_almacen = graphene.Field(ProductoAlmacenType, id=graphene.ID(required=True))
    productos_almacen_por_producto = graphene.List(ProductoAlmacenType, producto_id=graphene.ID(required=True))
    productos_almacen_por_almacen = graphene.List(ProductoAlmacenType, almacen_id=graphene.ID(required=True))
    
    # ==================== QUERIES DETALLE VENTA ====================
    all_detalles_venta = graphene.List(DetalleVentaType)
    detalle_venta = graphene.Field(DetalleVentaType, id=graphene.ID(required=True))
    detalles_por_venta = graphene.List(DetalleVentaType, venta_id=graphene.ID(required=True))

    # ==================== QUERIES REPORTES INVENTARIO ====================
    total_clientes = graphene.Int()
    total_empleados = graphene.Int()
    productos_proximo_vencimiento = graphene.List(ProductoProximoVencerType, dias=graphene.Int(default_value=90))
    resumen_inventario = graphene.Field(ResumenInventarioType)
    totales_usuarios = graphene.Field(TotalesUsuariosType)
    reporte_completo = graphene.Field(ReporteCompletoType)

    # ==================== QUERIES REPORTES VENTAS ====================
    ventas_por_mes = graphene.List(
        VentasMesType,
        fecha_inicio=graphene.String(description="Fecha inicio (YYYY-MM-DD)"),
        fecha_fin=graphene.String(description="Fecha fin (YYYY-MM-DD)")
    )
    fecha_mayor_venta = graphene.Field(FechaMayorVentaType)
    reporte_ventas = graphene.Field(ReporteVentasType)

    # ==================== RESOLVERS CLIENTE ====================
    def resolve_all_clientes(self, info, **kwargs):
        return Cliente.objects.all()

    def resolve_cliente(self, info, id):
        try:
            return Cliente.objects.get(pk=id)
        except Cliente.DoesNotExist:
            return None

    # ==================== RESOLVERS EMPLEADO ====================
    def resolve_all_empleados(self, info, **kwargs):
        return Empleado.objects.all()

    def resolve_empleado(self, info, id):
        try:
            return Empleado.objects.get(pk=id)
        except Empleado.DoesNotExist:
            return None

    def resolve_empleados_activos(self, info, **kwargs):
        return Empleado.objects.filter(activo=True)

    def resolve_me(self, info):
        user = info.context.user
        if user.is_authenticated and hasattr(user, 'is_2fa_enabled'):
            return user
        return None

    # ==================== RESOLVERS VENTA ====================
    def resolve_all_ventas(self, info, **kwargs):
        return Venta.objects.all()

    def resolve_venta(self, info, id):
        try:
            return Venta.objects.get(pk=id)
        except Venta.DoesNotExist:
            return None

    def resolve_ventas_por_cliente(self, info, cliente_id):
        try:
            return Venta.objects.filter(cliente_id=cliente_id)
        except Exception:
            return []

    def resolve_ventas_por_empleado(self, info, empleado_id):
        try:
            return Venta.objects.filter(empleado_id=empleado_id)
        except Exception:
            return []

    # ==================== RESOLVERS CATEGORIA ====================
    def resolve_all_categorias(self, info, **kwargs):
        return Categoria.objects.all()

    def resolve_categoria(self, info, id):
        try:
            return Categoria.objects.get(pk=id)
        except Categoria.DoesNotExist:
            return None

    # ==================== RESOLVERS PRODUCTO ====================
    def resolve_all_productos(self, info, **kwargs):
        return Producto.objects.all()

    def resolve_producto(self, info, id):
        try:
            return Producto.objects.get(pk=id)
        except Producto.DoesNotExist:
            return None

    def resolve_productos_por_categoria(self, info, categoria_id):
        try:
            return Producto.objects.filter(categoria_id=categoria_id)
        except Exception:
            return []

    # ==================== RESOLVERS ALMACEN ====================
    def resolve_all_almacenes(self, info, **kwargs):
        return Almacen.objects.all()

    def resolve_almacen(self, info, id):
        try:
            return Almacen.objects.get(pk=id)
        except Almacen.DoesNotExist:
            return None

    # ==================== RESOLVERS PRODUCTO ALMACEN ====================
    def resolve_all_productos_almacen(self, info, **kwargs):
        return ProductoAlmacen.objects.all()

    def resolve_producto_almacen(self, info, id):
        try:
            return ProductoAlmacen.objects.get(pk=id)
        except ProductoAlmacen.DoesNotExist:
            return None

    def resolve_productos_almacen_por_producto(self, info, producto_id):
        try:
            return ProductoAlmacen.objects.filter(producto_id=producto_id)
        except Exception:
            return []

    def resolve_productos_almacen_por_almacen(self, info, almacen_id):
        try:
            return ProductoAlmacen.objects.filter(almacen_id=almacen_id)
        except Exception:
            return []

    # ==================== RESOLVERS DETALLE VENTA ====================
    def resolve_all_detalles_venta(self, info, **kwargs):
        return DetalleVenta.objects.all()

    def resolve_detalle_venta(self, info, id):
        try:
            return DetalleVenta.objects.get(pk=id)
        except DetalleVenta.DoesNotExist:
            return None

    def resolve_detalles_por_venta(self, info, venta_id):
        try:
            return DetalleVenta.objects.filter(venta_id=venta_id)
        except Exception:
            return []

    # ==================== RESOLVERS REPORTES INVENTARIO ====================
    def resolve_total_clientes(self, info):
        """Obtiene total de clientes"""
        try:
            return Cliente.objects.count()
        except Exception as e:
            print(f"Error en resolve_total_clientes: {e}")
            return 0

    def resolve_total_empleados(self, info):
        """Obtiene total de empleados"""
        try:
            return Empleado.objects.count()
        except Exception as e:
            print(f"Error en resolve_total_empleados: {e}")
            return 0

    def resolve_productos_proximo_vencimiento(self, info, dias=90):
        """Obtiene productos próximos a vencer"""
        try:
            print(f"DEBUG: Buscando productos próximos a vencer en {dias} días")
            datos = ReporteService.obtener_productos_proximo_vencimiento(dias=dias)
            print(f"DEBUG: Datos retornados: {len(datos)} productos")
            resultado = []

            for item in datos:
                almacenes_list = []
                for almacen_info in item['almacenes']:
                    almacenes_list.append(
                        AlmacenStockType(
                            almacenNombre=almacen_info['almacen__nombre_am'],
                            stock=almacen_info['stock']
                        )
                    )

                resultado.append(
                    ProductoProximoVencerType(
                        id=item['id'],
                        nombreComercial=item['nombre_comercial'],
                        nombreTecnico=item['nombre_tecnico'],
                        fechaFabricacion=item['fecha_fabricacion'],
                        fechaVencimiento=item['fecha_vencimiento'],
                        diasFaltantes=item['dias_faltantes'],
                        categoria=item['categoria'],
                        stockTotal=item['stock_total'],
                        almacenes=almacenes_list,
                        porcentajeUrgencia=item['porcentaje_urgencia']
                    )
                )

            return resultado
        except Exception as e:
            print(f"Error en resolve_productos_proximo_vencimiento: {e}")
            import traceback
            traceback.print_exc()
            return []

    def resolve_resumen_inventario(self, info):
        """Obtiene resumen del inventario"""
        try:
            datos = ReporteService.obtener_resumen_inventario()
            return ResumenInventarioType(
                totalProductos=datos['total_productos'],
                totalCategorias=datos['total_categorias'],
                totalAlmacenes=datos['total_almacenes'],
                stockTotal=datos['stock_total']
            )
        except Exception as e:
            print(f"Error en resolve_resumen_inventario: {e}")
            return None

    def resolve_totales_usuarios(self, info):
        """Obtiene totales de usuarios"""
        try:
            datos = ReporteService.obtener_totales_usuarios()
            return TotalesUsuariosType(
                totalClientes=datos['total_clientes'],
                totalEmpleados=datos['total_empleados'],
                empleadosActivos=datos['empleados_activos']
            )
        except Exception as e:
            print(f"Error en resolve_totales_usuarios: {e}")
            return None

    def resolve_reporte_completo(self, info):
        """Obtiene reporte completo del sistema"""
        try:
            datos = ReporteService.obtener_reporte_completo()

            # Procesando usuarios
            usuarios = TotalesUsuariosType(
                totalClientes=datos['usuarios']['total_clientes'],
                totalEmpleados=datos['usuarios']['total_empleados'],
                empleadosActivos=datos['usuarios']['empleados_activos']
            )

            # Procesando inventario
            inventario = ResumenInventarioType(
                totalProductos=datos['inventario']['total_productos'],
                totalCategorias=datos['inventario']['total_categorias'],
                totalAlmacenes=datos['inventario']['total_almacenes'],
                stockTotal=datos['inventario']['stock_total']
            )

            # Procesando productos próximos a vencer
            productos_proximos = []
            for item in datos['productos_proximos_vencer']:
                almacenes_list = []
                for almacen_info in item['almacenes']:
                    almacenes_list.append(
                        AlmacenStockType(
                            almacenNombre=almacen_info['almacen__nombre_am'],
                            stock=almacen_info['stock']
                        )
                    )

                productos_proximos.append(
                    ProductoProximoVencerType(
                        id=item['id'],
                        nombreComercial=item['nombre_comercial'],
                        nombreTecnico=item['nombre_tecnico'],
                        fechaFabricacion=item['fecha_fabricacion'],
                        fechaVencimiento=item['fecha_vencimiento'],
                        diasFaltantes=item['dias_faltantes'],
                        categoria=item['categoria'],
                        stockTotal=item['stock_total'],
                        almacenes=almacenes_list,
                        porcentajeUrgencia=item['porcentaje_urgencia']
                    )
                )

            return ReporteCompletoType(
                usuarios=usuarios,
                inventario=inventario,
                productosProximoVencer=productos_proximos
            )
        except Exception as e:
            print(f"Error en resolve_reporte_completo: {e}")
            return None

    # ==================== RESOLVERS REPORTES VENTAS ====================
    def resolve_ventas_por_mes(self, info, fecha_inicio=None, fecha_fin=None):
        """Obtiene ventas agrupadas por mes (ordenadas por cantidad vendida - descendente)
        
        Args:
            fecha_inicio: Filtro de fecha inicial (formato YYYY-MM-DD)
            fecha_fin: Filtro de fecha final (formato YYYY-MM-DD)
        """
        try:
            print(f"DEBUG: ventasPorMes llamado con fecha_inicio={fecha_inicio}, fecha_fin={fecha_fin}")
            datos = ReporteService.obtener_ventas_por_mes(fecha_inicio=fecha_inicio, fecha_fin=fecha_fin)
            print(f"DEBUG: Se retornaron {len(datos)} registros")
            resultado = []

            for item in datos:
                resultado.append(
                    VentasMesType(
                        mes=item['mes'],
                        ano=item['ano'],
                        totalVentas=item['total_ventas'],
                        cantidadVendida=item['cantidad_vendida'],
                        cantidadArticulos=item['cantidad_articulos'],
                        promedioVenta=item['promedio_venta']
                    )
                )

            return resultado
        except Exception as e:
            print(f"Error en resolve_ventas_por_mes: {e}")
            import traceback
            traceback.print_exc()
            return []

    def resolve_fecha_mayor_venta(self, info):
        """Obtiene la fecha con mayor venta"""
        try:
            datos = ReporteService.obtener_fecha_mayor_venta()
            if not datos:
                return None

            return FechaMayorVentaType(
                fecha=datos['fecha'],
                totalVentas=datos['total_ventas'],
                montoTotal=datos['monto_total'],
                mejorProducto=datos['mejor_producto'],
                cantidadProducto=datos['cantidad_producto']
            )
        except Exception as e:
            print(f"Error en resolve_fecha_mayor_venta: {e}")
            return None

    def resolve_reporte_ventas(self, info):
        """Obtiene reporte completo de ventas"""
        try:
            datos = ReporteService.obtener_reporte_ventas()

            # Procesando ventas por mes
            ventas_mes = []
            for item in datos['ventas_por_mes']:
                ventas_mes.append(
                    VentasMesType(
                        mes=item['mes'],
                        ano=item['ano'],
                        totalVentas=item['total_ventas'],
                        cantidadVendida=item['cantidad_vendida'],
                        cantidadArticulos=item['cantidad_articulos'],
                        promedioVenta=item['promedio_venta']
                    )
                )

            # Procesando fecha mayor venta
            fecha_mayor = None
            if datos['fecha_mayor_venta']:
                fecha_mayor = FechaMayorVentaType(
                    fecha=datos['fecha_mayor_venta']['fecha'],
                    totalVentas=datos['fecha_mayor_venta']['total_ventas'],
                    montoTotal=datos['fecha_mayor_venta']['monto_total'],
                    mejorProducto=datos['fecha_mayor_venta']['mejor_producto'],
                    cantidadProducto=datos['fecha_mayor_venta']['cantidad_producto']
                )

            return ReporteVentasType(
                ventasPorMes=ventas_mes,
                fechaMayorVenta=fecha_mayor,
                totalVentasGenerales=datos['total_ventas_generales'],
                cantidadVentasGenerales=datos['cantidad_ventas_generales']
            )
        except Exception as e:
            print(f"Error en resolve_reporte_ventas: {e}")
            import traceback
            traceback.print_exc()
            return None
    
    # ==================== QUERIES EMPLEADO ====================
    all_empleados = graphene.List(EmpleadoType)
    empleado = graphene.Field(EmpleadoType, id=graphene.ID(required=True))
    empleados_activos = graphene.List(EmpleadoType)
    me = graphene.Field(EmpleadoType)
    
    # ==================== QUERIES VENTA ====================
    all_ventas = graphene.List(VentaType)
    venta = graphene.Field(VentaType, id=graphene.ID(required=True))
    ventas_por_cliente = graphene.List(VentaType, cliente_id=graphene.ID(required=True))
    ventas_por_empleado = graphene.List(VentaType, empleado_id=graphene.ID(required=True))
    
    # ==================== QUERIES CATEGORIA ====================
    all_categorias = graphene.List(CategoriaType)
    categoria = graphene.Field(CategoriaType, id=graphene.ID(required=True))
    
    # ==================== QUERIES PRODUCTO ====================
    all_productos = graphene.List(ProductoType)
    producto = graphene.Field(ProductoType, id=graphene.ID(required=True))
    productos_por_categoria = graphene.List(ProductoType, categoria_id=graphene.ID(required=True))
    
    # ==================== QUERIES ALMACEN ====================
    all_almacenes = graphene.List(AlmacenType)
    almacen = graphene.Field(AlmacenType, id=graphene.ID(required=True))
    
    # ==================== QUERIES PRODUCTO ALMACEN ====================
    all_productos_almacen = graphene.List(ProductoAlmacenType)
    producto_almacen = graphene.Field(ProductoAlmacenType, id=graphene.ID(required=True))
    productos_almacen_por_producto = graphene.List(ProductoAlmacenType, producto_id=graphene.ID(required=True))
    productos_almacen_por_almacen = graphene.List(ProductoAlmacenType, almacen_id=graphene.ID(required=True))
    
    # ==================== QUERIES DETALLE VENTA ====================
    all_detalles_venta = graphene.List(DetalleVentaType)
    detalle_venta = graphene.Field(DetalleVentaType, id=graphene.ID(required=True))
    detalles_por_venta = graphene.List(DetalleVentaType, venta_id=graphene.ID(required=True))

    # ==================== RESOLVERS CLIENTE ====================
    def resolve_all_clientes(self, info, **kwargs):
        return Cliente.objects.all()

    def resolve_cliente(self, info, id):
        try:
            return Cliente.objects.get(pk=id)
        except Cliente.DoesNotExist:
            return None

    # ==================== RESOLVERS EMPLEADO ====================
    def resolve_all_empleados(self, info, **kwargs):
        return Empleado.objects.all()

    def resolve_empleado(self, info, id):
        try:
            return Empleado.objects.get(pk=id)
        except Empleado.DoesNotExist:
            return None

    def resolve_empleados_activos(self, info, **kwargs):
        return Empleado.objects.filter(activo=True)

    def resolve_me(self, info):
        user = info.context.user
        if user.is_authenticated and hasattr(user, 'is_2fa_enabled'):
            return user
        return None

    # ==================== RESOLVERS VENTA ====================
    def resolve_all_ventas(self, info, **kwargs):
        return Venta.objects.all()

    def resolve_venta(self, info, id):
        try:
            return Venta.objects.get(pk=id)
        except Venta.DoesNotExist:
            return None

    def resolve_ventas_por_cliente(self, info, cliente_id):
        try:
            return Venta.objects.filter(cliente_id=cliente_id)
        except Exception:
            return []

    def resolve_ventas_por_empleado(self, info, empleado_id):
        try:
            return Venta.objects.filter(empleado_id=empleado_id)
        except Exception:
            return []

    # ==================== RESOLVERS CATEGORIA ====================
    def resolve_all_categorias(self, info, **kwargs):
        return Categoria.objects.all()

    def resolve_categoria(self, info, id):
        try:
            return Categoria.objects.get(pk=id)
        except Categoria.DoesNotExist:
            return None

    # ==================== RESOLVERS PRODUCTO ====================
    def resolve_all_productos(self, info, **kwargs):
        return Producto.objects.all()

    def resolve_producto(self, info, id):
        try:
            return Producto.objects.get(pk=id)
        except Producto.DoesNotExist:
            return None

    def resolve_productos_por_categoria(self, info, categoria_id):
        try:
            return Producto.objects.filter(categoria_id=categoria_id)
        except Exception:
            return []

    # ==================== RESOLVERS ALMACEN ====================
    def resolve_all_almacenes(self, info, **kwargs):
        return Almacen.objects.all()

    def resolve_almacen(self, info, id):
        try:
            return Almacen.objects.get(pk=id)
        except Almacen.DoesNotExist:
            return None

    # ==================== RESOLVERS PRODUCTO ALMACEN ====================
    def resolve_all_productos_almacen(self, info, **kwargs):
        return ProductoAlmacen.objects.all()

    def resolve_producto_almacen(self, info, id):
        try:
            return ProductoAlmacen.objects.get(pk=id)
        except ProductoAlmacen.DoesNotExist:
            return None

    def resolve_productos_almacen_por_producto(self, info, producto_id):
        try:
            return ProductoAlmacen.objects.filter(producto_id=producto_id)
        except Exception:
            return []

    def resolve_productos_almacen_por_almacen(self, info, almacen_id):
        try:
            return ProductoAlmacen.objects.filter(almacen_id=almacen_id)
        except Exception:
            return []

    # ==================== RESOLVERS DETALLE VENTA ====================
    def resolve_all_detalles_venta(self, info, **kwargs):
        return DetalleVenta.objects.all()

    def resolve_detalle_venta(self, info, id):
        try:
            return DetalleVenta.objects.get(pk=id)
        except DetalleVenta.DoesNotExist:
            return None

    def resolve_detalles_por_venta(self, info, venta_id):
        try:
            return DetalleVenta.objects.filter(venta_id=venta_id)
        except Exception:
            return []
    # ==================== QUERIES CLIENTE ====================
    all_clientes = graphene.List(ClienteType)
    cliente = graphene.Field(ClienteType, id=graphene.ID(required=True))
    
    # ==================== QUERIES EMPLEADO ====================
    all_empleados = graphene.List(EmpleadoType)
    empleado = graphene.Field(EmpleadoType, id=graphene.ID(required=True))
    empleados_activos = graphene.List(EmpleadoType)
    me = graphene.Field(EmpleadoType)
    
    # ==================== QUERIES VENTA ====================
    all_ventas = graphene.List(VentaType)
    venta = graphene.Field(VentaType, id=graphene.ID(required=True))
    ventas_por_cliente = graphene.List(VentaType, cliente_id=graphene.ID(required=True))
    ventas_por_empleado = graphene.List(VentaType, empleado_id=graphene.ID(required=True))
    
    # ==================== QUERIES CATEGORIA ====================
    all_categorias = graphene.List(CategoriaType)
    categoria = graphene.Field(CategoriaType, id=graphene.ID(required=True))
    
    # ==================== QUERIES PRODUCTO ====================
    all_productos = graphene.List(ProductoType)
    producto = graphene.Field(ProductoType, id=graphene.ID(required=True))
    productos_por_categoria = graphene.List(ProductoType, categoria_id=graphene.ID(required=True))
    
    # ==================== QUERIES ALMACEN ====================
    all_almacenes = graphene.List(AlmacenType)
    almacen = graphene.Field(AlmacenType, id=graphene.ID(required=True))
    
    # ==================== QUERIES PRODUCTO ALMACEN ====================
    all_productos_almacen = graphene.List(ProductoAlmacenType)
    producto_almacen = graphene.Field(ProductoAlmacenType, id=graphene.ID(required=True))
    productos_almacen_por_producto = graphene.List(ProductoAlmacenType, producto_id=graphene.ID(required=True))
    productos_almacen_por_almacen = graphene.List(ProductoAlmacenType, almacen_id=graphene.ID(required=True))
    
    # ==================== QUERIES DETALLE VENTA ====================
    all_detalles_venta = graphene.List(DetalleVentaType)
    detalle_venta = graphene.Field(DetalleVentaType, id=graphene.ID(required=True))
    detalles_por_venta = graphene.List(DetalleVentaType, venta_id=graphene.ID(required=True))
    
    # ==================== QUERIES REPORTES ====================
    total_clientes = graphene.Int()
    total_empleados = graphene.Int()
    productos_proximo_vencimiento = graphene.List(ProductoProximoVencerType, dias=graphene.Int(default_value=90))
    resumen_inventario = graphene.Field(ResumenInventarioType)
    totales_usuarios = graphene.Field(TotalesUsuariosType)
    reporte_completo = graphene.Field(ReporteCompletoType)

    # ==================== RESOLVERS CLIENTE ====================
    def resolve_all_clientes(self, info, **kwargs):
        return Cliente.objects.all()

    def resolve_cliente(self, info, id):
        try:
            return Cliente.objects.get(pk=id)
        except Cliente.DoesNotExist:
            return None

    # ==================== RESOLVERS EMPLEADO ====================
    def resolve_all_empleados(self, info, **kwargs):
        return Empleado.objects.all()

    def resolve_empleado(self, info, id):
        try:
            return Empleado.objects.get(pk=id)
        except Empleado.DoesNotExist:
            return None

    def resolve_empleados_activos(self, info, **kwargs):
        return Empleado.objects.filter(activo=True)

    def resolve_me(self, info):
        user = info.context.user
        if user.is_authenticated and hasattr(user, 'is_2fa_enabled'):
            return user
        return None

    # ==================== RESOLVERS VENTA ====================
    def resolve_all_ventas(self, info, **kwargs):
        return Venta.objects.all()

    def resolve_venta(self, info, id):
        try:
            return Venta.objects.get(pk=id)
        except Venta.DoesNotExist:
            return None

    def resolve_ventas_por_cliente(self, info, cliente_id):
        try:
            return Venta.objects.filter(cliente_id=cliente_id)
        except Exception:
            return []

    def resolve_ventas_por_empleado(self, info, empleado_id):
        try:
            return Venta.objects.filter(empleado_id=empleado_id)
        except Exception:
            return []

    # ==================== RESOLVERS CATEGORIA ====================
    def resolve_all_categorias(self, info, **kwargs):
        return Categoria.objects.all()

    def resolve_categoria(self, info, id):
        try:
            return Categoria.objects.get(pk=id)
        except Categoria.DoesNotExist:
            return None

    # ==================== RESOLVERS PRODUCTO ====================
    def resolve_all_productos(self, info, **kwargs):
        return Producto.objects.all()

    def resolve_producto(self, info, id):
        try:
            return Producto.objects.get(pk=id)
        except Producto.DoesNotExist:
            return None

    def resolve_productos_por_categoria(self, info, categoria_id):
        try:
            return Producto.objects.filter(categoria_id=categoria_id)
        except Exception:
            return []

    # ==================== RESOLVERS ALMACEN ====================
    def resolve_all_almacenes(self, info, **kwargs):
        return Almacen.objects.all()

    def resolve_almacen(self, info, id):
        try:
            return Almacen.objects.get(pk=id)
        except Almacen.DoesNotExist:
            return None

    # ==================== RESOLVERS PRODUCTO ALMACEN ====================
    def resolve_all_productos_almacen(self, info, **kwargs):
        return ProductoAlmacen.objects.all()

    def resolve_producto_almacen(self, info, id):
        try:
            return ProductoAlmacen.objects.get(pk=id)
        except ProductoAlmacen.DoesNotExist:
            return None

    def resolve_productos_almacen_por_producto(self, info, producto_id):
        try:
            return ProductoAlmacen.objects.filter(producto_id=producto_id)
        except Exception:
            return []

    def resolve_productos_almacen_por_almacen(self, info, almacen_id):
        try:
            return ProductoAlmacen.objects.filter(almacen_id=almacen_id)
        except Exception:
            return []

    # ==================== RESOLVERS DETALLE VENTA ====================
    def resolve_all_detalles_venta(self, info, **kwargs):
        return DetalleVenta.objects.all()

    def resolve_detalle_venta(self, info, id):
        try:
            return DetalleVenta.objects.get(pk=id)
        except DetalleVenta.DoesNotExist:
            return None

    def resolve_detalles_por_venta(self, info, venta_id):
        try:
            return DetalleVenta.objects.filter(venta_id=venta_id)
        except Exception:
            return []

    # ==================== RESOLVERS REPORTES ====================
    def resolve_total_clientes(self, info):
        """Obtiene total de clientes"""
        try:
            return Cliente.objects.count()
        except Exception as e:
            print(f"Error en resolve_total_clientes: {e}")
            return 0

    def resolve_total_empleados(self, info):
        """Obtiene total de empleados"""
        try:
            return Empleado.objects.count()
        except Exception as e:
            print(f"Error en resolve_total_empleados: {e}")
            return 0

    def resolve_productos_proximo_vencimiento(self, info, dias=90):
        """Obtiene productos próximos a vencer"""
        try:
            datos = ReporteService.obtener_productos_proximo_vencimiento(dias=dias)
            resultado = []
            
            for item in datos:
                almacenes_list = []
                for almacen_info in item['almacenes']:
                    almacenes_list.append(
                        AlmacenStockType(
                            almacenNombre=almacen_info['almacen__nombre_am'],
                            stock=almacen_info['stock']
                        )
                    )
                
                resultado.append(
                    ProductoProximoVencerType(
                        id=item['id'],
                        nombreComercial=item['nombre_comercial'],
                        nombreTecnico=item['nombre_tecnico'],
                        fechaFabricacion=item['fecha_fabricacion'],
                        fechaVencimiento=item['fecha_vencimiento'],
                        diasFaltantes=item['dias_faltantes'],
                        categoria=item['categoria'],
                        stockTotal=item['stock_total'],
                        almacenes=almacenes_list,
                        porcentajeUrgencia=item['porcentaje_urgencia']
                    )
                )
            
            return resultado
        except Exception as e:
            print(f"Error en resolve_productos_proximo_vencimiento: {e}")
            return []

    def resolve_resumen_inventario(self, info):
        """Obtiene resumen del inventario"""
        try:
            datos = ReporteService.obtener_resumen_inventario()
            return ResumenInventarioType(
                totalProductos=datos['total_productos'],
                totalCategorias=datos['total_categorias'],
                totalAlmacenes=datos['total_almacenes'],
                stockTotal=datos['stock_total']
            )
        except Exception as e:
            print(f"Error en resolve_resumen_inventario: {e}")
            return None

    def resolve_totales_usuarios(self, info):
        """Obtiene totales de usuarios"""
        try:
            datos = ReporteService.obtener_totales_usuarios()
            return TotalesUsuariosType(
                totalClientes=datos['total_clientes'],
                totalEmpleados=datos['total_empleados'],
                empleadosActivos=datos['empleados_activos']
            )
        except Exception as e:
            print(f"Error en resolve_totales_usuarios: {e}")
            return None

    def resolve_reporte_completo(self, info):
        """Obtiene reporte completo del sistema"""
        try:
            datos = ReporteService.obtener_reporte_completo()
            
            # Procesando usuarios
            usuarios = TotalesUsuariosType(
                totalClientes=datos['usuarios']['total_clientes'],
                totalEmpleados=datos['usuarios']['total_empleados'],
                empleadosActivos=datos['usuarios']['empleados_activos']
            )
            
            # Procesando inventario
            inventario = ResumenInventarioType(
                totalProductos=datos['inventario']['total_productos'],
                totalCategorias=datos['inventario']['total_categorias'],
                totalAlmacenes=datos['inventario']['total_almacenes'],
                stockTotal=datos['inventario']['stock_total']
            )
            
            # Procesando productos próximos a vencer
            productos_proximos = []
            for item in datos['productos_proximos_vencer']:
                almacenes_list = []
                for almacen_info in item['almacenes']:
                    almacenes_list.append(
                        AlmacenStockType(
                            almacenNombre=almacen_info['almacen__nombre_am'],
                            stock=almacen_info['stock']
                        )
                    )
                
                productos_proximos.append(
                    ProductoProximoVencerType(
                        id=item['id'],
                        nombreComercial=item['nombre_comercial'],
                        nombreTecnico=item['nombre_tecnico'],
                        fechaFabricacion=item['fecha_fabricacion'],
                        fechaVencimiento=item['fecha_vencimiento'],
                        diasFaltantes=item['dias_faltantes'],
                        categoria=item['categoria'],
                        stockTotal=item['stock_total'],
                        almacenes=almacenes_list,
                        porcentajeUrgencia=item['porcentaje_urgencia']
                    )
                )
            
            return ReporteCompletoType(
                usuarios=usuarios,
                inventario=inventario,
                productosProximoVencer=productos_proximos
            )
        except Exception as e:
            print(f"Error en resolve_reporte_completo: {e}")
            return None