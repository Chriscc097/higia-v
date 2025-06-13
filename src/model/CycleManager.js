import FireStore from "../firebase/FireStore";

export class CycleManager {

    static async get(id) {
        if (!id) throw new Error("Error: No id");
        const cycle = await FireStore.get("cycles", id);
        if (!cycle) throw new Error("Error Not found " + id);
        return cycle;
    }

    static async getByLoad(loadId) {
        return await FireStore.getQuery(
            "cycles",
            "loadId",
            "==",
            loadId
        );
    }
}
