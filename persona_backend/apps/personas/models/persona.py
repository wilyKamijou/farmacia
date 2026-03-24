# apps/personas/models/persona.py
from django.db import models
from django.contrib.auth.models import AbstractUser
import pyotp

class Persona(AbstractUser):
    email = models.EmailField(unique=True)
    telefono = models.CharField(max_length=20, blank=True, null=True)
    fecha_nacimiento = models.DateField(null=True, blank=True)
    direccion = models.TextField(blank=True)
    activo = models.BooleanField(default=True)
    
    # Campos para 2FA
    otp_secret = models.CharField(max_length=32, blank=True, null=True)
    is_2fa_enabled = models.BooleanField(default=False)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    
    def __str__(self):
        return f"{self.first_name} {self.last_name}"
    
    def generate_otp_secret(self):
        """Genera un secreto para Google Authenticator"""
        self.otp_secret = pyotp.random_base32()
        self.save()
        return self.otp_secret
    
    def get_otp_provisioning_uri(self):
        """Genera URI para el QR de Google Authenticator"""
        if not self.otp_secret:
            self.generate_otp_secret()
        return pyotp.totp.TOTP(self.otp_secret).provisioning_uri(
            name=self.email,
            issuer_name="Persona App"
        )
    
    def verify_otp(self, otp_code):
        """Verifica el código OTP"""
        if not self.otp_secret:
            return False
        totp = pyotp.TOTP(self.otp_secret)
        return totp.verify(otp_code)
    
    class Meta:
        verbose_name_plural = "Personas"
        ordering = ['last_name', 'first_name']