
export interface ObjectStore {

    put(what: any): string ;

    get(key: string): any
}
