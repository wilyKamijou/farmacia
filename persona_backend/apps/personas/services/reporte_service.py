# apps/personas/services/reporte_service.py
from datetime import date, timedelta
from django.db.models import Sum, Count, Q, F
from django.db.models.functions import Coalesce
from apps.personas.models import Cliente, Empleado, Producto, Categoria, Almacen, ProductoAlmacen, Venta, DetalleVenta

class ReporteService:
    
    @staticmethod
    def obtener_productos_proximo_vencimiento(dias=90):
        """Retorna productos próximos a vencer"""
        try:
            hoy = date.today()
            fecha_limite = hoy + timedelta(days=dias)
            
            # Filtrar productos que vencen en los próximos días
            productos = Producto.objects.filter(
                fecha_venc__gte=hoy,
                fecha_venc__lte=fecha_limite
            )
            
            resultado = []
            for producto in productos:
                # Calcular días faltantes
                dias_faltantes = (producto.fecha_venc - hoy).days
                
                # Obtener stock por almacén
                stocks = ProductoAlmacen.objects.filter(producto=producto).values(
                    'almacen__nombre_am'
                ).annotate(stock=Sum('stock'))
                
                stock_total = ProductoAlmacen.objects.filter(producto=producto).aggregate(
                    total=Coalesce(Sum('stock'), 0)
                )['total']
                
                # Calcular porcentaje de urgencia
                porcentaje_urgencia = max(0, min(100, (1 - (dias_faltantes / dias)) * 100))
                
                resultado.append({
                    'id': str(producto.id),
                    'nombre_comercial': producto.nombre_pr,
                    'nombre_tecnico': producto.nombre_tc,
                    'fecha_fabricacion': producto.fecha_fab.isoformat(),
                    'fecha_vencimiento': producto.fecha_venc.isoformat(),
                    'dias_faltantes': dias_faltantes,
                    'categoria': producto.categoria.nombre_ct if producto.categoria else '',
                    'stock_total': stock_total,
                    'almacenes': [
                        {
                            'almacen__nombre_am': stock['almacen__nombre_am'],
                            'stock': stock['stock']
                        }
                        for stock in stocks
                    ],
                    'porcentaje_urgencia': porcentaje_urgencia
                })
            
            # Ordenar por días faltantes
            resultado.sort(key=lambda x: x['dias_faltantes'])
            return resultado
        except Exception as e:
            print(f"Error en obtener_productos_proximo_vencimiento: {e}")
            return []
    
    @staticmethod
    def obtener_resumen_inventario():
        """Retorna resumen del inventario"""
        try:
            return {
                'total_productos': Producto.objects.count(),
                'total_categorias': Categoria.objects.count(),
                'total_almacenes': Almacen.objects.count(),
                'stock_total': ProductoAlmacen.objects.aggregate(
                    total=Coalesce(Sum('stock'), 0)
                )['total']
            }
        except Exception as e:
            print(f"Error en obtener_resumen_inventario: {e}")
            return {
                'total_productos': 0,
                'total_categorias': 0,
                'total_almacenes': 0,
                'stock_total': 0
            }
    
    @staticmethod
    def obtener_totales_usuarios():
        """Retorna totales de usuarios"""
        try:
            return {
                'total_clientes': Cliente.objects.count(),
                'total_empleados': Empleado.objects.count(),
                'empleados_activos': Empleado.objects.filter(activo=True).count()
            }
        except Exception as e:
            print(f"Error en obtener_totales_usuarios: {e}")
            return {
                'total_clientes': 0,
                'total_empleados': 0,
                'empleados_activos': 0
            }
    
    @staticmethod
    def obtener_reporte_completo():
        """Retorna reporte completo del sistema"""
        try:
            return {
                'usuarios': ReporteService.obtener_totales_usuarios(),
                'inventario': ReporteService.obtener_resumen_inventario(),
                'productos_proximos_vencer': ReporteService.obtener_productos_proximo_vencimiento()
            }
        except Exception as e:
            print(f"Error en obtener_reporte_completo: {e}")
            return {
                'usuarios': {'total_clientes': 0, 'total_empleados': 0, 'empleados_activos': 0},
                'inventario': {'total_productos': 0, 'total_categorias': 0, 'total_almacenes': 0, 'stock_total': 0},
                'productos_proximos_vencer': []
            }
    
    @staticmethod
    def obtener_ventas_por_mes(fecha_inicio=None, fecha_fin=None):
        """Retorna ventas agrupadas por mes con totales calculados por cantidad de productos
        
        Args:
            fecha_inicio: Filtro de fecha inicial (formato YYYY-MM-DD)
            fecha_fin: Filtro de fecha final (formato YYYY-MM-DD)
        """
        try:
            from datetime import datetime
            
            # Filtrar ventas según fechas si se proporcionan
            ventas = Venta.objects.all().order_by('fecha_ve')
            
            print(f"\n=== DEBUG obtener_ventas_por_mes ===")
            print(f"Total de ventas en BD: {ventas.count()}")
            
            if fecha_inicio:
                if isinstance(fecha_inicio, str):
                    fecha_inicio = datetime.strptime(fecha_inicio, '%Y-%m-%d').date()
                ventas = ventas.filter(fecha_ve__gte=fecha_inicio)
                print(f"Filtradas por fecha_inicio: {ventas.count()}")
            
            if fecha_fin:
                if isinstance(fecha_fin, str):
                    fecha_fin = datetime.strptime(fecha_fin, '%Y-%m-%d').date()
                ventas = ventas.filter(fecha_ve__lte=fecha_fin)
                print(f"Filtradas por fecha_fin: {ventas.count()}")
            
            ventas_por_mes = {}
            for venta in ventas:
                mes_ano = venta.fecha_ve.strftime('%Y-%m')
                mes_nombre = venta.fecha_ve.strftime('%B')
                ano = venta.fecha_ve.year
                
                print(f"Procesando venta ID={venta.id} fecha={venta.fecha_ve}")
                
                if mes_ano not in ventas_por_mes:
                    ventas_por_mes[mes_ano] = {
                        'mes': mes_nombre,
                        'ano': ano,
                        'total_ventas': 0,
                        'cantidad_vendida': 0,
                        'cantidad_articulos': 0
                    }
                
                ventas_por_mes[mes_ano]['total_ventas'] += 1
                
                # Calcular cantidad de productos vendidos (por DetalleVenta)
                detalles = DetalleVenta.objects.filter(venta=venta)
                print(f"  Detalles de venta: {detalles.count()}")
                cantidad_mes = 0
                for detalle in detalles:
                    cant = detalle.cantidad_dv or 0
                    cantidad_mes += cant
                    print(f"    - Detalle: cantidad={cant}, producto={detalle.producto.nombre_pr if detalle.producto else 'N/A'}")
                
                ventas_por_mes[mes_ano]['cantidad_vendida'] += cantidad_mes
                ventas_por_mes[mes_ano]['cantidad_articulos'] += detalles.count()
            
            print(f"Meses procesados: {list(ventas_por_mes.keys())}")
            
            # Convertir a lista y ordenar por cantidad_vendida (descendente)
            resultado = []
            for mes_ano, datos in sorted(ventas_por_mes.items()):
                promedio = datos['cantidad_vendida'] / datos['total_ventas'] if datos['total_ventas'] > 0 else 0
                resultado.append({
                    'mes': datos['mes'],
                    'ano': datos['ano'],
                    'total_ventas': datos['total_ventas'],
                    'cantidad_vendida': datos['cantidad_vendida'],
                    'cantidad_articulos': datos['cantidad_articulos'],
                    'promedio_venta': round(promedio, 2)
                })
            
            # Ordenar por cantidad_vendida en orden descendente
            resultado.sort(key=lambda x: x['cantidad_vendida'], reverse=True)
            
            print(f"Resultado final: {len(resultado)} meses")
            for r in resultado:
                print(f"  {r['mes']} {r['ano']}: {r['cantidad_vendida']} unidades")
            print("=== FIN DEBUG ===\n")
            
            return resultado
        except Exception as e:
            print(f"\nError en obtener_ventas_por_mes: {e}")
            import traceback
            traceback.print_exc()
            return []
    
    @staticmethod
    def obtener_fecha_mayor_venta():
        """Retorna la fecha con mayor venta y sus detalles"""
        try:
            # Obtener suma de ventas por fecha
            ventas_por_fecha = {}
            ventas = Venta.objects.all()
            
            for venta in ventas:
                fecha_str = venta.fecha_ve.isoformat()
                monto = float(venta.monto_total_ve or 0)
                
                if fecha_str not in ventas_por_fecha:
                    ventas_por_fecha[fecha_str] = {
                        'fecha': fecha_str,
                        'total_ventas': 0,
                        'monto_total': 0.0,
                        'productos': {}
                    }
                
                ventas_por_fecha[fecha_str]['total_ventas'] += 1
                ventas_por_fecha[fecha_str]['monto_total'] += monto
                
                # Registrar productos vendidos
                detalles = DetalleVenta.objects.filter(venta=venta)
                for detalle in detalles:
                    producto_nombre = detalle.producto.nombre_pr if detalle.producto else 'Desconocido'
                    cantidad = detalle.cantidad_dv or 0
                    
                    if producto_nombre not in ventas_por_fecha[fecha_str]['productos']:
                        ventas_por_fecha[fecha_str]['productos'][producto_nombre] = 0
                    
                    ventas_por_fecha[fecha_str]['productos'][producto_nombre] += cantidad
            
            # Encontrar la fecha con mayor monto
            if not ventas_por_fecha:
                return None
            
            fecha_mayor = max(ventas_por_fecha.items(), key=lambda x: x[1]['monto_total'])
            datos_mayor = fecha_mayor[1]
            
            # Encontrar el producto más vendido en esa fecha
            mejor_producto = max(datos_mayor['productos'].items(), key=lambda x: x[1])
            
            return {
                'fecha': datos_mayor['fecha'],
                'total_ventas': datos_mayor['total_ventas'],
                'monto_total': round(datos_mayor['monto_total'], 2),
                'mejor_producto': mejor_producto[0],
                'cantidad_producto': mejor_producto[1]
            }
        except Exception as e:
            print(f"Error en obtener_fecha_mayor_venta: {e}")
            return None
    
    @staticmethod
    def obtener_reporte_ventas():
        """Retorna reporte completo de ventas"""
        try:
            # Calcular cantidad total de productos vendidos
            detalles_totales = DetalleVenta.objects.aggregate(
                cantidad=Coalesce(Sum('cantidad_dv'), 0),
                cantidad_items=Count('id')
            )
            
            cantidad_total_vendida = detalles_totales['cantidad'] or 0
            cantidad_items_vendidos = detalles_totales['cantidad_items'] or 0
            
            return {
                'ventas_por_mes': ReporteService.obtener_ventas_por_mes(),
                'fecha_mayor_venta': ReporteService.obtener_fecha_mayor_venta(),
                'total_ventas_generales': cantidad_total_vendida,
                'cantidad_ventas_generales': cantidad_items_vendidos
            }
        except Exception as e:
            print(f"Error en obtener_reporte_ventas: {e}")
            import traceback
            traceback.print_exc()
            return {
                'ventas_por_mes': [],
                'fecha_mayor_venta': None,
                'total_ventas_generales': 0,
                'cantidad_ventas_generales': 0
            }