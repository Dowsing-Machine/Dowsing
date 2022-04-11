import embed from 'vega-embed';

export async function newChart(el, spec, opts) {
    const {field,data}= opts;
    const vl = await embed(el, spec, opts.renderOption??{});
    if (field) {
        vl.view.data(field, data).run();
    }
    return vl;
}
