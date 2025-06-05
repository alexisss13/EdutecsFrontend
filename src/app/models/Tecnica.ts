export interface Tecnica {
  id: number;
  nombre: string;
  descripcion: string;
  explicacion?: string;
  link_externo?: string;
  carreras: string[];    
  momentos: string[];     
  pensamientos: string[]; 
  agrupaciones: string[]; 
  dificultades: string[];
  duraciones: string[];   
}