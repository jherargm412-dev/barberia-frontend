import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import EmojiEventsIcon from '@mui/icons-material/EmojiEventsOutlined';
import Inventory2Icon from '@mui/icons-material/Inventory2Outlined';
import LockClockIcon from '@mui/icons-material/LockClockOutlined';
import PaymentsIcon from '@mui/icons-material/PaymentsOutlined';
import PeopleIcon from '@mui/icons-material/PeopleOutlined';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLongOutlined';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import type { ReactNode } from 'react';

/** Ícono de cada reporte (tarjetas del catálogo y pestañas de arriba). */
export const ICONOS_REPORTE: Record<string, ReactNode> = {
  ventas: <ReceiptLongIcon />,
  'ingresos-egresos': <AccountBalanceWalletIcon />,
  'cierres-caja': <LockClockIcon />,
  existencias: <Inventory2Icon />,
  'movimientos-inventario': <SwapVertIcon />,
  comisiones: <PaymentsIcon />,
  'desempeno-barberos': <EmojiEventsIcon />,
  'visitas-clientes': <PeopleIcon />,
};
