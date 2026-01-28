export type ProductoImagenAPI = {
  id_producto?: number;
  is_principal?: boolean;
  orden?: number;
  url_imagen?: string;
};

export type ProductAPI = {
  id_producto: number | string;
  slug?: string;
  nombre_producto: string;
  nombre_marca?: string;
  id_marca?: number;
  id_categoria?: number;
  precio: number | string;
  qty?: number | string;
  imagenes?: (string | ProductoImagenAPI)[];
  descripcion?: string;
  is_active?: boolean;
  en_revision?: boolean;
};

export type EditableImage = {
  id: string;
  uri: string;
  isLocal?: boolean;
  orden?: number;
  is_principal?: boolean;
  name?: string;
  type?: string;
};

export type Category = {
  id_categoria: number;
  nombre_categoria: string;
  activa: boolean;
  icono?: string;
};

export type MarcaRow = {
  id_marca: number;
  nombre_marca: string;
  is_active: boolean;
};

export type Option = { id: number; label: string };

export type UpdateProductoJsonPayload = {
  nombre_producto: string;
  descripcion: string;
  qty: number;
  is_active: boolean;
  id_categoria: number;
  id_marca: number | null;
  slug: string;
  precio: number;
  keepUrls: string[];
  newUrls: string[];
  en_revision?: boolean;
};
