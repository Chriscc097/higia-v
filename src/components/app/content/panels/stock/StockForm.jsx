import { collection, onSnapshot } from "firebase/firestore";
import { CirclePlus, Save, X } from "lucide-react";
import { useEffect, useState } from "react";
import Select from "react-select";
import { toast } from "react-toastify"; // Adjust the import according to your firebase configuration
import FirebaseDataBase, { db } from "../../../../../firebase/FirebaseDatabase";
import { dateToYYYYMMDD } from "../../../../../utils/dates-functions";
import { useUserStore } from "./../../../../../context/userStore";
import PackageForm from "./PackageForm";
import "./StockForm.css";

const StockForm = ({ onClose }) => {
  const { currentUser } = useUserStore();
  const [packages, setPackages] = useState([]);
  const [isPackageFormSeen, setPackageFormSeen] = useState(false);
  const [clients, setClients] = useState([]);
  const [stock, setStock] = useState({
    package: {},
    uses: 0,
    clientId: "",
    status: "Consultorio",
    entry: {
      user: {
        uid: currentUser.id,
        username: currentUser.username,
      },
      date: dateToYYYYMMDD(new Date()),
    },
    quantity: 1,
    id: "",
  });

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "packages"), (snapshot) => {
      const stockData = snapshot.docs.map((doc) => doc.data());
      setPackages(stockData);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "clients"), (snapshot) => {
      const clientsData = snapshot.docs
        .map((doc) => doc.data())
        .filter((client) => client.status === true);
      setClients(clientsData);
    });

    return () => unsubscribe();
  }, []);

  const handleSelectedPackage = (e) => {
    const packageData = packages.find((pkg) => pkg.id === e.value);
    setStock((prevStock) => ({
      ...prevStock,
      package: packageData,
    }));
  };

  const handleSelectedClient = (e) => {
    setStock((prevStock) => ({
      ...prevStock,
      clientId: e.value,
    }));
  };

  const handleUses = (e) => {
    const uses = Number(e.target.value) || 1;
    setStock((prevStock) => ({
      ...prevStock,
      uses,
    }));
  };

  const handleQuantity = (e) => {
    const quantity = Number(e.target.value) || 1;
    setStock((prevStock) => ({
      ...prevStock,
      quantity,
    }));
  };

  const saveStock = async () => {
    if (!stock.package.id) {
      toast.warn("Selecciona primero un material");
      return;
    }
    if (!stock.clientId) {
      toast.warn("Selecciona primero un cliente");
      return;
    }
    if (!stock.quantity) {
      toast.warn("La cantidad debe ser mayor a 0");
      return;
    }

    if (!stock.uses) {
      toast.warn("Ingresa el número de usos");
      return;
    }

    let count = stock.package.count;
    const quantity = stock.quantity;

    await FirebaseDataBase.update("packages", {
      count: (quantity + count),
      id: stock.package.id,
    });

    const newStock = [];
    count++;
    delete stock.quantity;
    delete stock.package.count;

    for (let i = 1; i <= quantity; i++) {
      const newStockItem = {
        ...stock,
        number : count,
        id: `${stock.package.id}-${count}`,
      };
      newStock.push(newStockItem);
      count++;
    }

    newStock.forEach((stockItem) => {
      FirebaseDataBase.save("stock", stockItem);
    });

    toast.success("Material guardado correctamente");
    onClose();
  }; 

  return (
    <div className="formContainer">
      <div className="stockForm">
        <div className="formHeader">
          <h3>Nuevo Material</h3>
          <div className="buttonIconSection">
            <div className="buttonIcon save" onClick={() => saveStock()}>
              <Save size={20} color="white" />
            </div>
            <div className="buttonIcon close" onClick={() => onClose()}>
              <X size={15} color="white"/>
            </div>
          </div>
        </div>
        <div className="formContent">
          <div className="formRow">
            <div className="formItem">
              <Select
                className="selector"
                onChange={handleSelectedPackage}
                options={packages.map((pkg) => ({
                  value: pkg.id,
                  label: pkg.name,
                }))}
                placeholder="Material"
              />
            </div>
            <div
              className="buttonIcon save"
              onClick={() => setPackageFormSeen(true)}
            >
              <CirclePlus size={20} color="white" />
            </div>
            <div className="formItem">
              <Select
                className="selector"
                onChange={handleSelectedClient}
                options={clients.map((client) => ({
                  value: client.id,
                  label: client.businessName,
                }))}
                placeholder="Cliente"
              />
            </div>
          </div>
          <div className="formRow">
            <div className="formItem">
              <h4>Contenido</h4>
              <p className="contentDesc">
                {stock?.package.content || "Selecciona primero un material"}
              </p>
            </div>
            <div className="formItem">
              <h4>Existencias</h4>
              <p className="contentDesc">{stock?.package.count || 0}</p>
            </div>
          </div>
          <div className="formRow">
            <div className="formItem">
              <h4>Cantidad</h4>
              <input
                type="number"
                className="smallInput"
                name="quantity"
                min="1"
                onChange={handleQuantity}
              ></input>
            </div>
            <div className="formItem">
              <h4>Usos</h4>
              <input
                className="smallInput"
                type="number"
                name="uses"
                min="0"
                onChange={handleUses}
              ></input>
            </div>
            <div className="formItem long">
              <h4>Responsable</h4>
              <p>{currentUser.username}</p>
            </div>
            <div className="formItem">
              <h4>Fecha</h4>
              <p>{dateToYYYYMMDD(new Date())}</p>
            </div>
          </div>
        </div>
      </div>
      {isPackageFormSeen && (
        <PackageForm onClose={() => setPackageFormSeen(false)} />
      )}
    </div>
  );
};

export default StockForm;
