import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface InvoiceDocument {
    id: bigint;
    title: string;
    created: Time;
    jsonData: string;
}
export type Time = bigint;
export interface backendInterface {
    deleteDocument(id: bigint): Promise<void>;
    getDocument(id: bigint): Promise<InvoiceDocument>;
    listDocuments(): Promise<Array<InvoiceDocument>>;
    saveDocument(title: string, jsonData: string): Promise<bigint>;
    updateDocument(id: bigint, title: string, jsonData: string): Promise<void>;
}
