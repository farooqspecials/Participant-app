// src/components/WorkshopList.js

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { firestore } from '../firebaseConfig';

const WorkshopList = () => {
  const [workshops, setWorkshops] = useState([]);

  useEffect(() => {
    const fetchWorkshops = async () => {
      try {
        const workshopCollection = collection(firestore, 'workshops');
        const workshopSnapshot = await getDocs(workshopCollection);
        const workshopList = workshopSnapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((workshop) => workshop.active);
        console.log('Workshops fetched:', workshopList);
        setWorkshops(workshopList);
      } catch (error) {
        console.error('Error fetching workshops:', error);
      }
    };

    fetchWorkshops();
  }, []);

  if (workshops.length === 0) {
    return <div className="text-center">No active workshops available</div>;
  }

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">Active Workshops</h1>
      <ul className="list-group">
        {workshops.map((workshop) => (
          <li key={workshop.id} className="list-group-item">
            <Link to={`/questionnaire/${workshop.id}`}>{workshop.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default WorkshopList;
