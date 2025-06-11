import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  startAfter,
  where,
} from "firebase/firestore";
import { CirclePlus, Loader } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import useClientStore from "../../../../../context/clientStore";
import FirebaseDataBase, { db } from "../../../../../firebase/FirebaseDatabase";
import { dateToYYYYMMDD } from "../../../../../utils/dates-functions";
import ConfirmPopup from "../../../../utils/ConfirmPopup";
import { useUserStore } from "./../../../../../context/userStore";
import "./Stock.css";
import StockForm from "./StockForm";

const Stock = ({ client }) => {
  const [stockFormvisible, setStockFormVisible] = useState(false);
  const centerRef = useRef(null);
  const [stock, setStock] = useState(null);
  const [stockList, setStockList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stockView, setStockView] = useState(false);
  const [lastVisible, setLastVisible] = useState(null);
  const [packages, setPackages] = useState([]);
  const [stockTablevisible, setStockTableVisible] = useState({});
  const { currentUser } = useUserStore();
  const [confirmToggleActivation, setConfirmToggleActivation] = useState(null);
  const clients = useClientStore((state) => state.clients);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(collection(db, "packages"), orderBy("name", "asc")),
      (snapshot) => {
        const packagesdata = snapshot.docs.map((doc) => doc.data());
        setPackages(packagesdata);
      }
    );
    return () => unsubscribe();
  }, []);

  /// Function to load initial data
  const loadStocks = async (initial = false) => {
    if (loading) return;

    setLoading(true);
    const stockCollection = collection(db, "stock");
    const orderStock = orderBy("number", "desc");
    const limitstock = limit(20);
    const whereClient = where("clientId", "==", client.id);
    let q;

    if (initial) {
      q = query(stockCollection, orderStock, limitstock, whereClient);
    } else {
      q = query(
        stockCollection,
        orderStock,
        startAfter(lastVisible),
        limitstock,
        whereClient
      );
    }
    onSnapshot(q, async (querySnapshot) => {
      if (!querySnapshot.empty) {
        const newStock = querySnapshot.docs.map((doc) => ({
          id: doc.id, // Incluye el ID del documento para evitar duplicados
          ...doc.data(),
        }));

        await setStockList((prev) => {
          const mergedStock = [...prev, ...newStock];
          // Eliminar duplicados basados en el ID
          const uniqueStocks = mergedStock.filter(
            (stock, index, self) =>
              index === self.findIndex((c) => c.id === stock.id)
          );
          return initial ? newStock : uniqueStocks;
        });

        setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
      }
      setLoading(false);
    });
  };

  // Hook para cargar los datos iniciales
  useEffect(() => {
    loadStocks(true);
  }, []);

  useEffect(() => {
    centerRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [stockList]);

  // Manejo del scroll
  const handleScroll = () => {
    const container = centerRef.current;

    if (
      container.scrollTop + container.clientHeight >=
      container.scrollHeight - 10
    ) {
      loadStocks(); // Cargar más contactos al llegar al final
    }
  };

  useEffect(() => {
    const centerDiv = centerRef.current;
    if (centerDiv) {
      centerDiv.addEventListener("scroll", handleScroll);
    }
    return () => {
      if (centerDiv) {
        centerDiv.removeEventListener("scroll", handleScroll);
      }
    };
  }, [lastVisible]);

  const handleSelect = async (stock) => {
    setStock(stock);
    setStockView(true);
  };

  const groupedStockList = stockList.reduce((acc, stock) => {
    if (!acc[stock.clientId]) {
      acc[stock.clientId] = {};
    }
    if (!acc[stock.clientId][stock.package.id]) {
      acc[stock.clientId][stock.package.id] = [];
    }
    acc[stock.clientId][stock.package.id].push(stock);
    return acc;
  }, {});

  const toogleStockTableVisible = (key) => {
    setStockTableVisible((prev) => {
      return {
        ...prev,
        [key]: !prev[key],
      };
    });
  };

  const handleToogleActiveStock = async (stockItem) => {
    await setConfirmToggleActivation(stockItem);
  };

  const toogleActiveStock = async () => {
    if (loading) return;
    setLoading(true);

    let stockItem = { ...confirmToggleActivation };

    if (!stockItem) {
      setLoading(false);
      return;
    }

    if (stockItem.exit) {
      stockItem.exit = null;
      stockItem.status = "Consultorio";
    } else {
      stockItem.exit = {
        user: {
          username: currentUser.username,
          uid: currentUser.uid,
        },
        date: dateToYYYYMMDD(new Date()),
      };
      stockItem.status = "Disp. Final";
    }
    setConfirmToggleActivation(null);
    await FirebaseDataBase.update("stock", stockItem);
    setLoading(false);
  };

  return (
    <div className="stock">
      <div className="header">
        <h3 className="title">Inventario</h3>
        <div className="leftHeader">
          <div
            className="buttonIcon save"
            onClick={() => setStockFormVisible(true)}
          >
            <CirclePlus size={20} color="white" />
            <p>Nuevo Material</p>
          </div>
        </div>
      </div>
      <div className="content">
        <div className="clientSection" ref={centerRef}>
          <div>
            {packages
              .filter(
                (pk) =>
                  groupedStockList[client.id] &&
                  groupedStockList[client.id][pk.id] &&
                  groupedStockList[client.id][pk.id].length > 0
              )
              .map((pk) => (
                <div key={pk.id} className="packageInfo">
                  <div
                    className="packageInfoTitle"
                    onClick={() =>
                      toogleStockTableVisible(client.id + "-" + pk.id)
                    }
                  >
                    <div className="packageInfoItem">
                      <h1>
                        {groupedStockList[client.id][pk.id]?.filter(
                          (s) => !s?.exit
                        ).length || 0}
                      </h1>
                    </div>
                    <div className="packageInfoItem">
                      <h4>{pk.name}</h4>
                      <h5>{"Contenido: " + pk.content}</h5>
                    </div>
                  </div>

                  {stockTablevisible[client.id + "-" + pk.id] && (
                    <div className="table-container">
                      <table className="custom-table">
                        <thead>
                          <tr>
                            <th>Estado</th>
                            <th>Código</th>
                            <th>Ubicación</th>
                            <th>Alta</th>
                            <th>Responsable</th>
                            <th>Baja</th>
                            <th>Responsable</th>
                            <th>Usos</th>
                          </tr>
                        </thead>
                        <tbody>
                          {groupedStockList[client.id][pk.id]?.map(
                            (stockItem, index) => {
                              return (
                                <tr
                                  key={stockItem.id || index}
                                  onClick={() => handleSelect(stockItem)}
                                >
                                  <td
                                    onClick={() =>
                                      handleToogleActiveStock(stockItem)
                                    }
                                  >
                                    <span
                                      className={
                                        !stockItem?.exit
                                          ? "status-badge active"
                                          : "status-badge inactive"
                                      }
                                    >
                                      {!stockItem?.exit ? "Activo" : "Inactivo"}
                                    </span>
                                  </td>
                                  <td>{stockItem.id}</td>
                                  <td>
                                    <span
                                      className={
                                        stockItem.status === "Almacén"
                                          ? "status-badge in"
                                          : stockItem.status === "Disp. Final"
                                          ? "status-badge trash"
                                          : "status-badge out"
                                      }
                                    >
                                      {stockItem.status}
                                    </span>
                                  </td>
                                  <td>{stockItem?.entry?.date}</td>
                                  <td>{stockItem?.entry?.user?.username}</td>
                                  <td>{stockItem?.exit?.date}</td>
                                  <td>{stockItem?.exit?.user?.username}</td>
                                  <td>{stockItem?.uses}</td>
                                </tr>
                              );
                            }
                          )}
                        </tbody>
                      </table>
                      {loading && (
                        <div className="loading">
                          <Loader size={20} color="#292F36" />
                          <p>Cargando</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      </div>
      {stockFormvisible && (
        <StockForm onClose={() => setStockFormVisible(false)} />
      )}
      {!!confirmToggleActivation && (
        <ConfirmPopup
          message={
            !stock?.exit
              ? "¿Deseas dar de baja este material? Se registrará la fecha, el usuario responsable y se realizará la Disposición Final"
              : "¿Deseas dar de alta este material? Se eliminará la fecha y el usuario responsable de la baja. Y se moverá al Almacén"
          }
          onConfirm={toogleActiveStock}
          onCancel={() => setConfirmToggleActivation(null)}
        />
      )}
    </div>
  );
};
export default Stock;
