import { Timestamp } from "firebase/firestore";
import FireStore from "../firebase/FireStore";

export class ExitManager {

    static async get(id) {
        if (!id) throw new Error("Error: No id");
        const exit = await FireStore.get("exits", id);
        if (!exit) throw new Error("Error Not found " + id);
        return exit;
    }

    static async create(date, cycles, currentUser, isCancellation = false) {
        if (!date || !cycles || cycles?.length === 0 || !currentUser) throw new Error("Error missing information");

        const exit = await FireStore.save("exits", {
            user: {
                id: currentUser.id,
                username: currentUser.username,
            },
            date,
            timestamp: Timestamp.fromDate(new Date()),
            cycles: cycles.length,
        });

        if (!exit) throw new Error("Cannot create exit")

        cycles.forEach(async (cycle) => {
            const stock = {
                id: cycle.stockId,
                status: "Consultorio",
            }
            if (isCancellation) stock.uses = cycle.use;

            FireStore.update("stock", {
                id: cycle.stockId,
                status: "Consultorio",
            });

            FireStore.update("cycles", {
                id: cycle.id,
                exitId: exit.id,
            });
        });

        const grouped = cycles.reduce((acc, cycle) => {
            const id = cycle.loadId;
            if (!acc[id]) {
                acc[id] = { id, cycleCount: 0 };
            }
            acc[id].cycleCount += 1;
            return acc;
        }, {});

        const loadsInfo = Object.values(grouped);

        loadsInfo.forEach(async (loadInfo) => {
            const load = await FireStore.get("loads", loadInfo.id);
            load.cycles.remaining =  load.cycles.remaining - loadInfo.cycleCount;
            FireStore.update("loads", load);
        });

        return exit;
    }
}
