import FirebaseDataBase from "../firebase/FirebaseDatabase";

export class LoadManager {
    
    static async get(id) {
        if (!id) throw new Error("Error: No id");
        const load = await FirebaseDataBase.get("loads", id);
        if (!load) throw new Error("Error Not found " + id);
        return load;
    }

    static async update(load) {
        return await FirebaseDataBase.update("loads", load);
    }
}
