import Autocomplete from '@mui/material/Autocomplete';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import { useEffect, useState } from 'react';
import { listarServiciosHabilitados } from '../../../servicios_reservas';
import { obtenerError } from '../../../../shared/utils/obtenerError';

/** Servicio que se puede elegir como especialidad. */
interface OpcionServicio {
  idServicio: number;
  nombre: string;
  /** false si el barbero ya lo tenía pero luego se inhabilitó en el catálogo (CU08). */
  activoEnCatalogo: boolean;
}

interface Props {
  /** Ids de los servicios elegidos. */
  seleccionados: number[];
  onChange: (ids: number[]) => void;
  /** Al editar: servicios que el barbero ya tiene, para mostrarlos aunque ya no estén en el catálogo. */
  asignados?: { idServicio: number; nombre: string }[];
  error?: string;
}

/**
 * Especialidades del barbero = servicios del catálogo (CU08) que realiza. Al guardar quedan habilitados
 * para él (empleado_servicio), así que solo puede recibir citas de esos servicios (CU10, CU11).
 * Lo usan el formulario de Barberos (CU17) y el de Usuarios (CU01), solo con el rol Barbero.
 */
export default function EspecialidadesSelector({ seleccionados, onChange, asignados = [], error }: Props) {
  const [opciones, setOpciones] = useState<OpcionServicio[]>([]);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState('');

  useEffect(() => {
    listarServiciosHabilitados()
      .then((catalogo) => {
        const lista: OpcionServicio[] = catalogo.map((s) => ({ ...s, activoEnCatalogo: true }));
        // Los que ya tenía y ya no están en el catálogo se conservan para no quitárselos sin querer.
        for (const a of asignados) {
          if (!lista.some((o) => o.idServicio === a.idServicio)) {
            lista.push({ ...a, activoEnCatalogo: false });
          }
        }
        lista.sort((a, b) => a.nombre.localeCompare(b.nombre));
        setOpciones(lista);
      })
      .catch((err) => setErrorCarga(obtenerError(err).mensaje))
      .finally(() => setCargando(false));
    // Solo al montar: "asignados" viene del barbero cargado al abrir el formulario.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const elegidos = opciones.filter((o) => seleccionados.includes(o.idServicio));

  return (
    <Autocomplete
      multiple
      disableCloseOnSelect
      options={opciones}
      value={elegidos}
      loading={cargando}
      onChange={(_, nuevos) => onChange(nuevos.map((o) => o.idServicio))}
      getOptionLabel={(o) => (o.activoEnCatalogo ? o.nombre : `${o.nombre} (inhabilitado en el catálogo)`)}
      isOptionEqualToValue={(a, b) => a.idServicio === b.idServicio}
      noOptionsText="No hay servicios habilitados en el catálogo"
      renderValue={(valores, getItemProps) =>
        valores.map((o, index) => {
          const { key, ...itemProps } = getItemProps({ index });
          return <Chip key={key} label={o.nombre} size="small" {...itemProps} />;
        })
      }
      renderInput={(params) => (
        <TextField
          {...params}
          label="Especialidades"
          placeholder={elegidos.length === 0 ? 'Elija los servicios que realiza' : undefined}
          error={!!error || !!errorCarga}
          helperText={
            error ??
            (errorCarga
              ? `No se pudo cargar el catálogo de servicios (${errorCarga})`
              : 'Servicios que realiza. Solo podrá recibir citas de los servicios elegidos.')
          }
        />
      )}
    />
  );
}
