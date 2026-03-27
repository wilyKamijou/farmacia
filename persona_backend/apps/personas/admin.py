from django.contrib import admin
from .models import Cliente, Empleado, Venta, Categoria, Producto, Almacen, ProductoAlmacen, DetalleVenta

@admin.register(Cliente)
class ClienteAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'apellido', 'telefono')  # ✅ Campos que existen
    search_fields = ('nombre', 'apellido')
    list_filter = ()  # Sin filtros

@admin.register(Empleado)
class EmpleadoAdmin(admin.ModelAdmin):
    list_display = ('email', 'username', 'first_name', 'last_name', 'telefono_em', 'sueldo_em', 'activo')
    search_fields = ('email', 'username', 'first_name', 'last_name')
    list_filter = ('activo', 'is_2fa_enabled')
    fieldsets = (
        (None, {'fields': ('email', 'username', 'password')}),
        ('Información personal', {'fields': ('first_name', 'last_name', 'telefono_em', 'direccion_em')}),
        ('Información laboral', {'fields': ('sueldo_em', 'activo')}),
        ('2FA', {'fields': ('otp_secret', 'is_2fa_enabled')}),
    )

@admin.register(Venta)
class VentaAdmin(admin.ModelAdmin):
    list_display = ('id', 'fecha_ve', 'monto_total_ve', 'cliente', 'empleado')  # ✅ 'cliente' no 'liente'
    search_fields = ('cliente__nombre', 'cliente__apellido', 'empleado__email')
    list_filter = ('fecha_ve',)
    readonly_fields = ('fecha_ve',)

@admin.register(Categoria)
class CategoriaAdmin(admin.ModelAdmin):
    list_display = ('id', 'nombre_ct', 'descripcion_ct')
    search_fields = ('nombre_ct',)

@admin.register(Producto)
class ProductoAdmin(admin.ModelAdmin):
    list_display = ('id', 'nombre_pr', 'nombre_tc','precio', 'categoria', 'fecha_fab', 'fecha_venc')
    search_fields = ('nombre_pr', 'nombre_tc')
    list_filter = ('categoria',)

@admin.register(Almacen)
class AlmacenAdmin(admin.ModelAdmin):
    list_display = ('id', 'nombre_am', 'direccion_am')
    search_fields = ('nombre_am',)

@admin.register(ProductoAlmacen)
class ProductoAlmacenAdmin(admin.ModelAdmin):
    list_display = ('id', 'producto', 'almacen', 'stock')
    search_fields = ('producto__nombre_pr', 'almacen__nombre_am')
    list_filter = ('almacen',)

@admin.register(DetalleVenta)
class DetalleVentaAdmin(admin.ModelAdmin):
    list_display = ('id', 'venta', 'producto', 'almacen', 'cantidad_dv', 'precio_dv')
    search_fields = ('venta__id', 'producto__nombre_pr')
    list_filter = ('venta',)