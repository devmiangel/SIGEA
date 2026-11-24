import { useContext } from "react";
import { ContxtCurrentUser } from "../context/contextoUsuario";

export const useCurrentDataUser = () =>{
    return useContext(ContxtCurrentUser)
}