import { SanityClient } from "@sanity/client";
import React from "react"

export type AdminContextType = {
    admin: any;
    setAdmin: React.Dispatch<React.SetStateAction<any>>;
    sanityClient: SanityClient;
}