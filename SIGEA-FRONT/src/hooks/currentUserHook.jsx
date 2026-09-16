import { useContext } from "react";
import { ContxtCurrentUser } from "../context/dataUserContext";

export const useCurrentDataUser = () =>{
    return useContext(ContxtCurrentUser)
}