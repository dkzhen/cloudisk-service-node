import fs from "fs/promises";
import path from "path";

export async function getFolderSize(dir) {
    let total = 0;

    try {
        const files = await fs.readdir(dir);

        const stats = await Promise.all(
            files.map((file) => fs.stat(path.join(dir, file)))
        );

        for (const stat of stats) {
            if (stat.isFile()) {
                total += stat.size;
            }
        }
    } catch (err) {
        // Jika folder tidak ada, kembalikan 0
        return 0;
    }

    return total;
}