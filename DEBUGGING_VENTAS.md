# DEBUGGING GUIDE - ventasPorMes Query

## Pasos para diagnosticar por qué ventasPorMes devuelve []

### 1. Verificar datos en la BD
Accede al Django Shell:
```bash
python manage.py shell
```

Luego ejecuta:
```python
from apps.personas.models import Venta, DetalleVenta

# Ver total de ventas
total_ventas = Venta.objects.count()
print(f"Total de ventas: {total_ventas}")

# Ver detalles de ventas
total_detalles = DetalleVenta.objects.count()
print(f"Total de detalles de venta: {total_detalles}")

# Ver primeras ventas
for venta in Venta.objects.all()[:5]:
    print(f"Venta ID={venta.id}, fecha={venta.fecha_venta}, monto={venta.monto_total}")
    detalles = DetalleVenta.objects.filter(venta=venta)
    print(f"  - Detalles: {detalles.count()}")
    for detalle in detalles:
        print(f"    - Cantidad: {detalle.cantidad_dv}, Producto: {detalle.producto.nombre_pr if detalle.producto else 'N/A'}")

exit()
```

### 2. Revisar Log del Servidor
Cuando ejecutes una query GraphQL, verás en la consola del servidor logs como:

```
=== DEBUG obtener_ventas_por_mes ===
Total de ventas en BD: 5
Procesando venta ID=1 fecha=2026-03-20
  Detalles de venta: 2
    - Detalle: cantidad=5, producto=Ibuprofen
    - Detalle: cantidad=3, producto=Acetaminophen
Meses procesados: ['2026-03']
Resultado final: 1 meses
  March 2026: 8 unidades
=== FIN DEBUG ===
```

### 3. Query GraphQL para Probar
En GraphQL (ej: http://localhost:8000/graphql/):

```graphql
{
  ventasPorMes {
    mes
    ano
    totalVentas
    cantidadVendida
    cantidadArticulos
    promedioVenta
  }
}
```

O con filtros de fecha:
```graphql
{
  ventasPorMes(fechaInicio: "2026-01-01", fechaFin: "2026-12-31") {
    mes
    ano
    totalVentas
    cantidadVendida
    cantidadArticulos
    promedioVenta
  }
}
```

### 4. Si Retorna []
Posibles causas:
1. **No hay ventas en BD**: Ver paso 1
2. **Las ventas no tienen DetalleVenta**: Ver paso 1 - verificar que cada venta tiene detalles
3. **Error silencioso**: Revisar console.log del servidor - debe mostrar "=== DEBUG ===" para cada query

## Estructura Correcta
```
✅ queries.py - Contiene Query class con todos los resolvers
✅ types.py - Contiene VentasMesType y otros tipos GraphQL
✅ reporte_service.py - Contiene obtener_ventas_por_mes() con debugging
✅ schema.py - Importa Query de queries.py
✅ __init__.py - Exporta schema
❌ reports_queries.py - ELIMINADO (no se usaba)
```

## Si Sigue Sin Funcionar
1. Verifica la consola de Django - debe mostrar los logs de DEBUG
2. Copia el output completo del log
3. Verifica que hay datos con: `Venta.objects.count()`
4. Revisa que DetalleVenta.objects.count() > 0
