import { SanityClient } from "@sanity/client";
import React from "react"

export type AdminContextType = {
    admin: any;
    isPlanActiveState: boolean;
    setIsPlanActive: React.Dispatch<React.SetStateAction<boolean>>;
    setAdmin: React.Dispatch<React.SetStateAction<any>>;
    sanityClient: SanityClient;
}