import { useState } from "react";
import {
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
} from "recharts";

const BrandedPieChart = ({ data }) => {
  const [colors, setColors] = useState([
    "#4ecdc4",
    "#292f36",
    "#ff6b6b",
    "#ffe66d",
    "#7b2cbf",
    "#006bb0",
    "#50c878",
    "#00205b",
    "#e98a15",
    "#003b36",
  ]);

  return (
    <div style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={
                  colors[
                    index > colors.length
                      ? Math.floor(index / colors.length)
                      : index
                  ]
                }
              />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BrandedPieChart;
