export interface EmpresaProfile {
  IDEmpresario: number;
  IDUsuario: number;
  NombreEmpresa: string;
  NIF: string;
  IDSector: number;
  Ubicacion: string;
  SitioWeb: string;
  Foto: string;
  created_at: string | null;
  updated_at: string | null;
}

export interface DesempleadoProfile {
  IDDesempleado: number;
  IDUsuario: number;
  Nombre: string;
  Apellidos: string;
  DNI: string;
  Porfolios: string;
  Disponibilidad: string;
  Foto: string;
  created_at: string | null;
  updated_at: string | null;
}

export type Profile = EmpresaProfile | DesempleadoProfile | null;

export interface AuthResponse {
  StatusCode: number;
  ReasonPhrase: string;
  Message: string;
  Data?: {
    token: string;
    profile: Profile;
  };
}
