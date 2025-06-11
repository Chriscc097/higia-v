import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  startAfter,
} from "firebase/firestore";
import { CirclePlus, Loader, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import FirebaseDataBase, { db } from "../../../../../firebase/FirebaseDatabase";
import { dateToYYYYMMDD } from "../../../../../utils/dates-functions";
import ConfirmPopup from "../../../../utils/ConfirmPopup";
import PageIndex from "../../../../utils/pageIndex/PageIndex";
import { useUserStore } from "./../../../../../context/userStore";
import "./Activation.css";
import ActivationForm from "./ActivationForm";

const Activation = ({ onClose }) => {
  const { currentUser } = useUserStore();
  const [selectedActivation, setSelectedActivation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activations, setActivations] = useState([]);
  const [confirmUnactivation, setConfirmUnactivation] = useState(null);

  
  const [pageIndex, setPageIndex] = useState(1);
  const [pageLength, setPageLength] = useState(20);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState(null);

  useEffect(() => {
    setLoading(true);
    const loadCollection = collection(db, "activations");
    const queryOrder = orderBy("entry.date", "desc");
    const queryLimit = limit(pageLength);

    const q = lastDoc
      ? query(loadCollection, queryOrder, startAfter(lastDoc), queryLimit)
      : query(loadCollection, queryOrder, queryLimit);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setActivations(data);
      setHasMore(snapshot.docs.length === pageLength);
      setLoading(false);
      // Guarda el último documento para la siguiente página
      if (snapshot.docs.length > 0) {
        setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      }
    });

    return () => unsubscribe();
  }, [pageIndex]);

  const unActiveStock = async () => {
    const toastId = toast.loading("Inactivando...");
    let activationItem = { ...confirmUnactivation, active: false };
    activationItem.exit = {
      date: new Date(),
      user: {
        uid: currentUser.uid,
        username: currentUser.username,
      },
    };

    FirebaseDataBase.update("activations", activationItem)
      .then(() => {
        toast.update(toastId, {
          render: "Proceso inactivado",
          type: "success",
          autoClose: 3000,
          isLoading: false,
        });
      })
      .catch(() => {
        toast.update(toastId, {
          render: "Error al inactivar",
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
      });
    setConfirmUnactivation(null);
  };

  return (
    <div className="formContainer">
      <div className="activation">
        <div className="header">
          <h2>Activaciones</h2>
          <div className="leftHeader">
            <div className="buttons">
              <div
                className="imgbutton"
                onClick={() => setSelectedActivation({})}
              >
                <CirclePlus size={20} color="white"/>
                <p>Nueva Activación</p>
              </div>
            </div>
            <div className="closeButtonColumn">
              <div className="buttonIcon close" onClick={() => onClose()}>
                <X size={15} color="white"/>
              </div>
            </div>
          </div>
        </div>
        <div className="content">
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Estado</th>
                  <th>Activación</th>
                  <th>Responsable</th>
                  <th>Lote</th>
                  <th>vida Útil</th>
                  <th>Vencimiento</th>
                  <th>Inactivación</th>
                  <th>Responsable</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {activations?.map((activationItem, index) => {
                  return (
                    <tr key={index}>
                      <td>
                        <span
                          className={
                            activationItem.exit
                              ? "status-badge inactive"
                              : "status-badge active"
                          }
                        >
                          {activationItem.exit ? "Inactivo" : "Activo"}
                        </span>
                      </td>
                      <td>
                        {dateToYYYYMMDD(activationItem.entry.date.toDate())}
                      </td>
                      <td>{activationItem.entry.user.username}</td>
                      <td>{activationItem.lot}</td>
                      <td>{activationItem.life}</td>
                      <td>{dateToYYYYMMDD(activationItem.exp.toDate())}</td>
                      <td>
                        {activationItem.exit
                          ? dateToYYYYMMDD(activationItem.exit?.date?.toDate())
                          : ""}
                      </td>
                      <td>
                        {activationItem.exit
                          ? activationItem.exit.user.username
                          : ""}
                      </td>
                      <td>
                        {!activationItem.exit && (
                          <span>
                            <div
                              className="buttonIcon delete"
                              onClick={() =>
                                setConfirmUnactivation(activationItem)
                              }
                            >
                              <Trash2 size={20} color="white"/>
                            </div>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {loading && (
              <div className="loading">
                <Loader size={20} color="#292F36" />
                <p>Cargando</p>
              </div>
            )}
          </div>
          <PageIndex
            currentIndex={pageIndex}
            onChange={(i) => setPageIndex(i)}
            hasMore={hasMore}
          />
        </div>
        {selectedActivation && (
          <ActivationForm
            onClose={() => setSelectedActivation(null)}
            activation={selectedActivation}
          />
        )}
        {!!confirmUnactivation && (
          <ConfirmPopup
            message={
              "¿Estás segura que desea inactivar la activación seleccionada?, esto no se puede deshacer"
            }
            onConfirm={unActiveStock}
            onCancel={() => setConfirmUnactivation(null)}
          />
        )}
      </div>
    </div>
  );
};

export default Activation;
