import FirebaseDataBase from "../firebase/FirebaseDatabase";

export class CycleManager {

    static async get(id) {
        if (!id) throw new Error("Error: No id");
        const cycle = await FirebaseDataBase.get("cycles", id);
        if (!cycle) throw new Error("Error Not found " + id);
        return cycle;
    }

    static async getByLoad(loadId) {
        return await FirebaseDataBase.getQuery(
            "cycles",
            "loadId",
            "==",
            loadId
        );
    }
}
