import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface AnimationProject {
    created: Time;
    jsonData: string;
    name: string;
}
export type Time = bigint;
export interface backendInterface {
    deleteProject(id: bigint): Promise<void>;
    getProject(id: bigint): Promise<AnimationProject>;
    listProjects(): Promise<Array<AnimationProject>>;
    saveProject(name: string, jsonData: string): Promise<bigint>;
}
