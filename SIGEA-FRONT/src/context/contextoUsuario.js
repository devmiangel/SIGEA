import { createContext } from "react";

// Contexto del usuario autenticado. Lo provee CurrentUserDataProvider
// (context/dataUserContext.jsx) y se lee con useCurrentDataUser (hooks/currentUserHook.jsx).
// Está en su propio archivo para que dataUserContext.jsx solo exporte componentes
// (requisito de Fast Refresh de Vite).
export const ContxtCurrentUser = createContext()
