"use server";

import { put } from "@vercel/blob";
import { revalidatePath } from "next/cache";

export async function uploadImage(formData: FormData) {
    const file = formData.get("file") as File;

    if (!file) {
        throw new Error("No file provided");
    }

    // Upload to Vercel Blob in the 'gallery/' folder
    const blob = await put(`gallery/${file.name}`, file, {
        access: "public",
    });

    // Revalidate the home page to show the new image if it's integrated with the data source
    revalidatePath("/");

    return blob;
}
