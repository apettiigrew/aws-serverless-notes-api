import { z } from "zod";

export interface Note {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
}

export const createNoteSchema = z.object({
    name: z.string().min(1, "Name is required"),
});

export const updateNoteSchema = z.object({
    name: z.string().min(1, "Name is required"),
});



