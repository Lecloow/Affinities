import { ApiService } from "./ApiService.ts";
import { DemoApiService } from "./DemoApiService.ts";

const isDemo = !import.meta.env.VITE_API_BASE_URL;
//export const API_BASE_URL = "http://100.122.111.95:8080".replace(/\/$/, '')  //import.meta.env.VITE_API_BASE_URL
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL


export const Api = isDemo ? DemoApiService : ApiService;