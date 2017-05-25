export class DataSet { 
    settings: { fill: string, title: string};
    dataset: Array<{ 
        x: string, 
        y: number,
        measure: string,
        lower: number,
        upper: number,
        sex: string

     }>
}