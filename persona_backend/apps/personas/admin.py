from django.contrib import admin
from .models import Persona, Empleado, Venta, Categoria, Producto, Almacen, ProductoAlmacen, DetalleVenta

@admin.register(Persona)
class PersonaAdmin(admin.ModelAdmin):
    list_display = ('email', 'first_name', 'last_name', 'telefono', 'activo')
    search_fields = ('email', 'first_name', 'last_name')
    list_filter = ('activo', 'is_2fa_enabled')

@admin.register(Empleado)
class EmpleadoAdmin(admin.ModelAdmin):
    list_display = ('nombre_em', 'apellido_em', 'sueldo_em', 'telefono_em', 'activo')
    search_fields = ('nombre_em', 'apellido_em')
    list_filter = ('activo',)

@admin.register(Venta)
class VentaAdmin(admin.ModelAdmin):
    list_display = ('id', 'fecha_ve', 'monto_total_ve', 'persona', 'empleado')
    search_fields = ('persona__email', 'empleado__nombre_em')
    list_filter = ('fecha_ve',)
    readonly_fields = ('fecha_ve',)

@admin.register(Categoria)
class CategoriaAdmin(admin.ModelAdmin):
    list_display = ('id', 'nombre_ct', 'descripcion_ct')
    search_fields = ('nombre_ct',)

@admin.register(Producto)
class ProductoAdmin(admin.ModelAdmin):
    list_display = ('id', 'nombre_pr', 'nombre_tc', 'categoria', 'fecha_fab', 'fecha_venc')
    search_fields = ('nombre_pr', 'nombre_tc')
    list_filter = ('categoria', 'fecha_fab', 'fecha_venc')

@admin.register(Almacen)
class AlmacenAdmin(admin.ModelAdmin):
    list_display = ('id', 'nombre_am', 'direccion_am')
    search_fields = ('nombre_am', 'direccion_am')

@admin.register(ProductoAlmacen)
class ProductoAlmacenAdmin(admin.ModelAdmin):
    list_display = ('id', 'producto', 'almacen', 'stock')
    search_fields = ('producto__nombre_pr', 'almacen__nombre_am')
    list_filter = ('almacen', 'producto')

@admin.register(DetalleVenta)
class DetalleVentaAdmin(admin.ModelAdmin):
    list_display = ('id', 'venta', 'producto', 'almacen', 'cantidad_dv', 'precio_dv')
    search_fields = ('venta__id', 'producto__nombre_pr')
    list_filter = ('venta', 'producto')
