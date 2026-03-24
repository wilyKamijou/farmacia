# apps/personas/graphql/types.py
import graphene
from graphene_django import DjangoObjectType
from apps.personas.models import Persona, Empleado, Venta, Categoria, Producto, Almacen, ProductoAlmacen, DetalleVenta

class PersonaType(DjangoObjectType):
    class Meta:
        model = Persona
        fields = "__all__"


class EmpleadoType(DjangoObjectType):
    class Meta:
        model = Empleado
        fields = "__all__"


class VentaType(DjangoObjectType):
    class Meta:
        model = Venta
        fields = "__all__"


class CategoriaType(DjangoObjectType):
    class Meta:
        model = Categoria
        fields = "__all__"


class ProductoType(DjangoObjectType):
    class Meta:
        model = Producto
        fields = "__all__"


class AlmacenType(DjangoObjectType):
    class Meta:
        model = Almacen
        fields = "__all__"


class ProductoAlmacenType(DjangoObjectType):
    class Meta:
        model = ProductoAlmacen
        fields = "__all__"


class DetalleVentaType(DjangoObjectType):
    class Meta:
        model = DetalleVenta
        fields = "__all__"