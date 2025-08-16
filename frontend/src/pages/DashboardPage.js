import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';
import PersonCard from '../components/PersonCard';
import AddPointsModal from '../components/AddPointsModal';

const DashboardPage = () => {
  const [persons, setPersons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showAddPersonForm, setShowAddPersonForm] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [showPointsModal, setShowPointsModal] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm();

  // Charger la liste des personnes
  const fetchPersons = async () => {
    try {
      const response = await axios.get('/persons');
      setPersons(response.data.persons);
    } catch (error) {
      toast.error('Erreur lors du chargement des personnes');
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPersons();
  }, []);

  // Créer une nouvelle personne
  const onCreatePerson = async (data) => {
    setIsCreating(true);
    try {
      const response = await axios.post('/persons', { name: data.name });
      setPersons([response.data.person, ...persons]);
      toast.success('Personne créée avec succès !');
      reset();
      setShowAddPersonForm(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la création');
    } finally {
      setIsCreating(false);
    }
  };

  // Ouvrir le modal d'ajout de points
  const handleAddPoints = (person) => {
    setSelectedPerson(person);
    setShowPointsModal(true);
  };

  // Callback après ajout de points
  const handlePointsAdded = (updatedPerson) => {
    setPersons(persons.map(p => 
      p.id === updatedPerson.id ? updatedPerson : p
    ));
    setShowPointsModal(false);
    setSelectedPerson(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* En-tête */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Tableau de bord
            </h1>
            <p className="mt-2 text-gray-600">
              Gérez les points de votre équipe
            </p>
          </div>
          <button
            onClick={() => setShowAddPersonForm(!showAddPersonForm)}
            className="btn btn-primary btn-lg"
          >
            {showAddPersonForm ? 'Annuler' : 'Ajouter une personne'}
          </button>
        </div>

        {/* Formulaire d'ajout de personne */}
        {showAddPersonForm && (
          <div className="mt-6 card animate-slide-up">
            <div className="card-header">
              <h3 className="text-lg font-semibold">Nouvelle personne</h3>
            </div>
            <div className="card-content">
              <form onSubmit={handleSubmit(onCreatePerson)} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Nom de la personne
                  </label>
                  <input
                    {...register('name', {
                      required: 'Le nom est requis',
                      minLength: {
                        value: 1,
                        message: 'Le nom doit contenir au moins 1 caractère'
                      },
                      maxLength: {
                        value: 100,
                        message: 'Le nom ne peut pas dépasser 100 caractères'
                      }
                    })}
                    type="text"
                    className="input mt-1"
                    placeholder="Entrez le nom de la personne"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="btn btn-primary btn-md"
                  >
                    {isCreating ? (
                      <div className="flex items-center">
                        <LoadingSpinner size="sm" className="mr-2" />
                        Création...
                      </div>
                    ) : (
                      'Créer'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddPersonForm(false);
                      reset();
                    }}
                    className="btn btn-secondary btn-md"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Total personnes</p>
                <p className="text-2xl font-bold text-gray-900">{persons.length}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Points moyens</p>
                <p className="text-2xl font-bold text-gray-900">
                  {persons.length > 0 
                    ? Math.round(persons.reduce((sum, p) => sum + p.score, 0) / persons.length)
                    : 0
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Score maximum</p>
                <p className="text-2xl font-bold text-gray-900">
                  {persons.length > 0 ? Math.max(...persons.map(p => p.score)) : 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des personnes */}
      {persons.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">👥</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucune personne trouvée
          </h3>
          <p className="text-gray-600 mb-4">
            Commencez par ajouter une personne pour gérer ses points.
          </p>
          <button
            onClick={() => setShowAddPersonForm(true)}
            className="btn btn-primary btn-md"
          >
            Ajouter la première personne
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {persons.map((person) => (
            <PersonCard
              key={person.id}
              person={person}
              onAddPoints={() => handleAddPoints(person)}
            />
          ))}
        </div>
      )}

      {/* Modal d'ajout de points */}
      {showPointsModal && selectedPerson && (
        <AddPointsModal
          person={selectedPerson}
          onClose={() => {
            setShowPointsModal(false);
            setSelectedPerson(null);
          }}
          onPointsAdded={handlePointsAdded}
        />
      )}
    </div>
  );
};

export default DashboardPage;
