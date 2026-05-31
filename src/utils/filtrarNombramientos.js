export const filtrarNombramientos = (
    nombramientos,
    busqueda,
    fechaFiltro,
    turnoFiltro
) => {

    const normalize = (s = '') =>
        String(s).toLowerCase();

    return nombramientos.filter(item => {

        const coincideTexto =
            normalize(item.buque).includes(
                normalize(busqueda)
            ) ||
            normalize(item.folio).includes(
                normalize(busqueda)
            );

        const coincideFecha =
            !fechaFiltro ||
            item.fecha === fechaFiltro;

        let coincideTurno = true;

        if (
            turnoFiltro &&
            turnoFiltro !== 'Todos los turnos'
        ) {
            coincideTurno =
                normalize(item.titulo)
                    .includes(normalize(turnoFiltro));
        }

        return (
            coincideTexto &&
            coincideFecha &&
            coincideTurno
        );
    });
};