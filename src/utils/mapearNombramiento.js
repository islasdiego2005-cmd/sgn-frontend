
export const mapearNombramiento = (item) => {

    const fechaRaw =
        item.fecha_carga ||
        item.fecha ||
        item.fechaCarga ||
        item.created_at ||
        item.createdAt ||
        null;

    let fecha = 'S/F';

    if (fechaRaw) {

        if (typeof fechaRaw === 'string') {

            fecha = fechaRaw.includes('T')
                ? fechaRaw.split('T')[0]
                : (
                    fechaRaw.includes(' ')
                        ? fechaRaw.split(' ')[0]
                        : fechaRaw
                );

        } else if (fechaRaw instanceof Date) {

            fecha = fechaRaw
                .toISOString()
                .split('T')[0];

        } else {

            fecha = String(fechaRaw)
                .split('T')[0];
        }
    }

    return {

    id: item.id_nombramiento,

    fecha,

    folio: item.codigo_nombramiento,

    titulo: item.turno,

    buque:
        item.barco ||
        item.nombre_buque,

    sindicalizados:
        (item.vacantes || []).reduce(
            (acc, v) =>
                acc + (v.cantidad || 0),
            0
        ),

    personalApoyo:
        item.personal_apoyo ||
        item.personalApoyo ||
        0,

    vacantes:
        item.vacantes || [],

    raw: item
};
};