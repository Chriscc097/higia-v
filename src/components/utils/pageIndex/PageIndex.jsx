import { limit, onSnapshot, query, startAfter } from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import BrandedButton from "../brandedButton/BrandedButton";
import "./PageIndex.css";

export default function PageIndex({ queryBuilder, onDataChange, pageSize = 20, refreshToken = 0 }) {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(0);
  const [pagesCursors, setPagesCursors] = useState([]);
  const [loading, setLoading] = useState(false);
  const unsubscribeRef = useRef(null);

  // Ejecuta el fetch inicial o cuando cambia el refreshToken
  useEffect(() => {
    resetAndFetch();

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [refreshToken]);

  const resetAndFetch = () => {
    setData([]);
    setPage(0);
    setPagesCursors([]);
    fetchPage(0, null);
  };

  const fetchPage = (pageNumber, cursor) => {
    setLoading(true);

    let baseQuery = queryBuilder();
    baseQuery = query(baseQuery, limit(pageSize));

    if (cursor) {
      baseQuery = query(baseQuery, startAfter(cursor));
    }

    if (unsubscribeRef.current) {
      unsubscribeRef.current();
    }

    unsubscribeRef.current = onSnapshot(
      baseQuery,
      (snapshot) => {
        if (!snapshot.empty) {
          const docs = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          setData(docs);
          if (typeof onDataChange === "function") onDataChange(docs);

          setPagesCursors((prev) => {
            const newCursors = [...prev];
            newCursors[pageNumber] = snapshot.docs[snapshot.docs.length - 1];
            return newCursors;
          });

          setPage(pageNumber);
        } else {
          setData([]);
          if (typeof onDataChange === "function") onDataChange([]);
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error al obtener datos:", error);
        setLoading(false);
      }
    );
  };

  const next = () => {
    if (loading || data.length < pageSize) return;
    const currentCursor = pagesCursors[page];
    fetchPage(page + 1, currentCursor);
  };

  const prev = () => {
    if (loading || page === 0) return;
    const previousCursor = page - 2 >= 0 ? pagesCursors[page - 2] : null;
    fetchPage(page - 1, previousCursor);
  };

  return (
    <div className="pageIndexContainer">
      <div className="pageIndex">
        <BrandedButton type="left" onClick={prev} isLoading={loading} disabled={loading || page === 0} />
        <label>{page + 1}</label>
        <BrandedButton type="right" onClick={next} isLoading={loading} disabled={loading || data.length < pageSize} />
      </div>
    </div>
  );
}
