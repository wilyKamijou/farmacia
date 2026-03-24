# apps/personas/models.py
from django.db import models
from django.contrib.auth.models import AbstractUser
import pyotp

class Persona(AbstractUser):  # Hereda de AbstractUser para tener autenticación
    # Campos adicionales
    telefono = models.CharField(max_length=20, blank=True, null=True)
    fecha_nacimiento = models.DateField(null=True, blank=True)
    direccion = models.TextField(blank=True)
    activo = models.BooleanField(default=True)
    
    # Campos para 2FA
    otp_secret = models.CharField(max_length=32, blank=True, null=True)
    is_2fa_enabled = models.BooleanField(default=False)
    
    # Usar email como campo de login
    email = models.EmailField(unique=True)
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']  # username es requerido por AbstractUser
    
    def __str__(self):
        return f"{self.first_name} {self.last_name}"
    
    def generate_otp_secret(self):
        self.otp_secret = pyotp.random_base32()
        self.save()
        return self.otp_secret
    
    def get_otp_provisioning_uri(self):
        if not self.otp_secret:
            self.generate_otp_secret()
        return pyotp.totp.TOTP(self.otp_secret).provisioning_uri(
            name=self.email,
            issuer_name="Persona App"
        )
    
    def verify_otp(self, otp_code):
        if not self.otp_secret:
            return False
        totp = pyotp.TOTP(self.otp_secret)
        return totp.verify(otp_code)
    
    class Meta:
        verbose_name_plural = "Personas"
        ordering = ['last_name', 'first_name']


class Empleado(models.Model):
    """Modelo para gestionar empleados"""
    nombre_em = models.CharField(max_length=100)
    apellido_em = models.CharField(max_length=100)
    direccion_em = models.TextField(blank=True, null=True)
    sueldo_em = models.DecimalField(max_digits=10, decimal_places=2)
    telefono_em = models.CharField(max_length=20, blank=True, null=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    activo = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.nombre_em} {self.apellido_em}"
    
    class Meta:
        verbose_name_plural = "Empleados"
        ordering = ['apellido_em', 'nombre_em']


class Venta(models.Model):
    """Modelo para gestionar ventas"""
    fecha_ve = models.DateTimeField(auto_now_add=True)
    monto_total_ve = models.DecimalField(max_digits=12, decimal_places=2)
    persona = models.ForeignKey(Persona, on_delete=models.CASCADE, related_name='ventas')
    empleado = models.ForeignKey(Empleado, on_delete=models.CASCADE, related_name='ventas')
    descripcion = models.TextField(blank=True, null=True)
    
    def __str__(self):
        return f"Venta #{self.id} - {self.fecha_ve.strftime('%d/%m/%Y')}"
    
    class Meta:
        verbose_name_plural = "Ventas"
        ordering = ['-fecha_ve']


class Categoria(models.Model):
    """Modelo para gestionar categorías de productos"""
    nombre_ct = models.CharField(max_length=100)
    descripcion_ct = models.TextField(blank=True, null=True)
    
    def __str__(self):
        return self.nombre_ct
    
    class Meta:
        verbose_name_plural = "Categorias"
        ordering = ['nombre_ct']


class Producto(models.Model):
    """Modelo para gestionar productos"""
    nombre_pr = models.CharField(max_length=100)
    nombre_tc = models.CharField(max_length=100)
    fecha_fab = models.DateField()
    fecha_venc = models.DateField()
    descripcion_pr = models.TextField(blank=True, null=True)
    concentracion_qm = models.CharField(max_length=100, blank=True, null=True)
    composicion_qm = models.TextField(blank=True, null=True)
    categoria = models.ForeignKey(Categoria, on_delete=models.CASCADE, related_name='productos')
    
    def __str__(self):
        return f"{self.nombre_pr} ({self.nombre_tc})"
    
    class Meta:
        verbose_name_plural = "Productos"
        ordering = ['nombre_pr']


class Almacen(models.Model):
    """Modelo para gestionar almacenes"""
    nombre_am = models.CharField(max_length=100)
    descripcion_am = models.TextField(blank=True, null=True)
    direccion_am = models.TextField()
    
    def __str__(self):
        return self.nombre_am
    
    class Meta:
        verbose_name_plural = "Almacenes"
        ordering = ['nombre_am']


class ProductoAlmacen(models.Model):
    """Tabla de asociación entre Producto y Almacen"""
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE, related_name='almacenes')
    almacen = models.ForeignKey(Almacen, on_delete=models.CASCADE, related_name='productos')
    stock = models.IntegerField(default=0)
    
    def __str__(self):
        return f"{self.producto.nombre_pr} - {self.almacen.nombre_am}: {self.stock} unidades"
    
    class Meta:
        verbose_name_plural = "Producto Almacen"
        unique_together = ('producto', 'almacen')
        ordering = ['producto', 'almacen']


class DetalleVenta(models.Model):
    """Tabla de asociación entre Venta y ProductoAlmacen"""
    venta = models.ForeignKey(Venta, on_delete=models.CASCADE, related_name='detalles')
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE, related_name='detalles_venta')
    almacen = models.ForeignKey(Almacen, on_delete=models.CASCADE, related_name='detalles_venta')
    cantidad_dv = models.IntegerField()
    precio_dv = models.DecimalField(max_digits=10, decimal_places=2)
    
    def __str__(self):
        return f"Venta #{self.venta.id} - {self.producto.nombre_pr} x{self.cantidad_dv}"
    
    class Meta:
        verbose_name_plural = "Detalles Venta"
        unique_together = ('venta', 'producto', 'almacen')
        ordering = ['venta', 'producto']