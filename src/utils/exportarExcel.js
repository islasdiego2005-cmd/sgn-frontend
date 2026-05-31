import axios from 'axios';
import * as XLSX from 'xlsx-js-style';

const API_URL = import.meta.env.VITE_API_URL;

export const exportarExcel = async (lista) => {

if (lista.length === 0) return;

        const wb = XLSX.utils.book_new();

        for (const item of lista) {

            const folioSafe = String(item.folio)
                .replace(/[^A-Za-z0-9_-]/g, '_')
                .slice(0, 20);

            const vacantesStr =
                (item.vacantes || [])
                    .map(v =>
                        `${v.puesto || v.nombre_puesto || v.puesto_requerido || v.nombre}: ${v.cantidad || 0}`
                    )
                    .join(' | ');

            const detalleRows = [
                { Campo: 'ID', Valor: item.id },
                { Campo: 'Folio', Valor: item.folio },
                { Campo: 'Codigo', Valor: item.raw?.codigo_nombramiento || item.folio },
                { Campo: 'Buque', Valor: item.buque },
                { Campo: 'Turno', Valor: item.titulo },
                { Campo: 'FechaCarga', Valor: item.raw?.fecha_carga || item.fecha },
                { Campo: 'FechaCierre', Valor: item.raw?.fecha_cierre || '' },
                { Campo: 'Sindicalizados', Valor: item.sindicalizados },
                { Campo: 'Vacantes', Valor: vacantesStr }
            ];

            if (item.raw && typeof item.raw === 'object') {

                Object.keys(item.raw).forEach(k => {

                    const val = item.raw[k];

                    if (val === null) return;

                    if (
                        ['string', 'number', 'boolean']
                            .includes(typeof val)
                    ) {

                        detalleRows.push({
                            Campo: k,
                            Valor: val
                        });
                    }
                });
            }

            const wsDetalle =
                XLSX.utils.json_to_sheet(
                    detalleRows,
                    {
                        header: [
                            'Campo',
                            'Valor'
                        ]
                    }
                );

            const headerStyle = {
                font: {
                    bold: true,
                    color: { rgb: 'FFFFFF' }
                },
                fill: {
                    fgColor: { rgb: '122C5F' }
                },
                alignment: {
                    horizontal: 'center'
                }
            };

            const rangoDet =
                XLSX.utils.decode_range(
                    wsDetalle['!ref']
                );

            for (
                let C = rangoDet.s.c;
                C <= rangoDet.e.c;
                ++C
            ) {

                const direccion =
                    XLSX.utils.encode_cell({
                        c: C,
                        r: 0
                    });

                if (wsDetalle[direccion]) {
                    wsDetalle[direccion].s =
                        headerStyle;
                }
            }

            wsDetalle['!cols'] = [
                { wch: 25 },
                { wch: 60 }
            ];

            XLSX.utils.book_append_sheet(
                wb,
                wsDetalle,
                `Detalle_${folioSafe}`
            );

            try {

                const id =
                    item.id ||
                    item.raw?.id_nombramiento;

                const resp =
                    await axios.get(
                        `${API_URL}/api/nombramientos/${id}/postulados`
                    );

                const postulados =
                    resp.data || [];

                const postuladosRows =
                    postulados.map(p => ({
                        Matricula:
                            p.num_control ||
                            p.matricula ||
                            '',
                        Trabajador:
                            p.nombre_completo ||
                            p.nombre ||
                            '',
                        Puesto:
                            Array.isArray(
                                p.puesto_requerido
                            )
                                ? p.puesto_requerido.join(', ')
                                : (
                                    p.puesto_requerido ||
                                    p.puesto ||
                                    ''
                                ),
                        Hora:
                            p.fecha_postulacion
                                ? new Date(
                                    p.fecha_postulacion
                                ).toLocaleString('es-MX')
                                : '',
                        Estado:
                            p.resultado ||
                            p.estado ||
                            ''
                    }));

                const wsPost =
                    XLSX.utils.json_to_sheet(
                        postuladosRows
                    );

                XLSX.utils.book_append_sheet(
                    wb,
                    wsPost,
                    `Postulados_${folioSafe}`
                );

            } catch {

                const wsError =
                    XLSX.utils.json_to_sheet([
                        {
                            Info:
                                'No se pudieron obtener postulados'
                        }
                    ]);

                XLSX.utils.book_append_sheet(
                    wb,
                    wsError,
                    `Postulados_${folioSafe}`
                );
            }
        }

    XLSX.writeFile(
        wb,
        'Reporte_Nombramientos_Completo.xlsx'
    );
};