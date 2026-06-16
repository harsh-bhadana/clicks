import { getImages } from "./lib/images";
import HomeClient from "./HomeClient";

export const revalidate = 60;

export default async function Page() {
    const images = await getImages();

    return <HomeClient initialImages={images} />;
}
