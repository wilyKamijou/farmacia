# apps/personas/services/persona_service.py
from apps.personas.models.persona import Persona

class PersonaService:
    
    @staticmethod
    def get_all():
        return Persona.objects.all()
    
    @staticmethod
    def get_by_id(id):
        try:
            return Persona.objects.get(id=id)
        except Persona.DoesNotExist:
            return None
    
    @staticmethod
    def create(data):
        persona = Persona(**data)
        persona.save()
        return persona
    
    @staticmethod
    def update(id, data):
        persona = PersonaService.get_by_id(id)
        if persona:
            for key, value in data.items():
                setattr(persona, key, value)
            persona.save()
        return persona
    
    @staticmethod
    def delete(id):
        persona = PersonaService.get_by_id(id)
        if persona:
            persona.delete()
            return True
        return False