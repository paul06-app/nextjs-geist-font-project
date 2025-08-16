import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';
import AddPointsModal from '../components/AddPointsModal';

const PersonDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [person, setPerson] = useState(null);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPointsModal, setShowPointsModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  // Charger les données de la personne
  const fetchPersonData = async () => {
    try {
      const [personResponse, historyResponse, statsResponse] = await Promise.all([
        axios.get(`/persons/${id}`),
        axios.get(`/points/history/${id}?page=${currentPage}&limit=10`),
        axios.get(`/points/stats/${id}`)
      ]);

      setPerson(personResponse.data.person);
      setHistory(historyResponse.data.history);
      setPagination(historyResponse.data.pagination);
      setStats(statsResponse.data.stats);
    } catch (error) {
      if (error.response?.status === 404) {
        toast.error('Personne non trouvée');
        navigate('/');
      } else {
        toast.error('Erreur lors du chargement des données');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPersonData();
  }, [id, currentPage]);

  // Callback après ajout de points
  const handlePointsAdded = (updatedPerson) => {
    setPerson(updatedPerson);
    setShowPointsModal(false);
    // Recharger l'historique et les stats
    fetchPersonData();
  };

  // Supprimer une entrée de l'historique
  const handleDeleteHistoryEntry = async (historyId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir annuler cette modification ?')) {
      return;
    }

    try {
      await axios.delete(`/points/${historyId}`);
      toast.success('Modification annulée avec succès');
      fetchPersonData(); // Recharger toutes les données
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'annulation');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!person) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Personne non trouvée
          </h2>
          <Link to="/" className="btn btn-primary">
            Retour au tableau de bord
          </Link>
        </div>
      </div>
    );
  }

  const getScoreColor = (score, maxScore) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'text-success-600';
    if (percentage >= 60) return 'text-yellow-600';
    if (percentage >= 40) return 'text-orange-600';
    return 'text-danger-600';
  };

  const progressPercentage = (person.score / person.maxScore) * 100;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Navigation */}
      <div className="mb-6">
        <Link
          to="/"
          className="text-gray-600 hover:text-gray-900 flex items-center"
        >
          ← Retour au tableau de bord
        </Link>
      </div>

      {/* En-tête avec informations de la personne */}
      <div className="card mb-8">
        <div className="card-header">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {person.name}
              </h1>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>Créé par: {person.createdBy?.email}</span>
                <span>•</span>
                <span>Créé le: {new Date(person.createdAt).toLocaleDateString('fr-FR')}</span>
              </div>
            </div>
            <button
              onClick={() => setShowPointsModal(true)}
              className="btn btn-primary btn-lg"
            >
              Modifier points
            </button>
          </div>
        </div>

        <div className="card-content">
          {/* Score actuel */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg font-medium text-gray-700">Score actuel</span>
              <div className="flex items-center space-x-2">
                <span className={`text-4xl font-bold ${getScoreColor(person.score, person.maxScore)}`}>
                  {person.score}
                </span>
                <span className="text-xl text-gray-500">/ {person.maxScore}</span>
              </div>
            </div>
            
            {/* Barre de progression */}
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500"
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-sm text-gray-600 mt-1">
              <span>0</span>
              <span>{Math.round(progressPercentage)}%</span>
              <span>{person.maxScore}</span>
            </div>
          </div>

          {/* Statistiques */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Total modifications</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalModifications}</p>
              </div>
              <div className="bg-success-50 rounded-lg p-4">
                <p className="text-sm text-success-600">Points ajoutés</p>
                <p className="text-2xl font-bold text-success-700">+{stats.pointsAdded.total}</p>
                <p className="text-xs text-success-600">({stats.pointsAdded.count} fois)</p>
              </div>
              <div className="bg-danger-50 rounded-lg p-4">
                <p className="text-sm text-danger-600">Points retirés</p>
                <p className="text-2xl font-bold text-danger-700">-{stats.pointsRemoved.total}</p>
                <p className="text-xs text-danger-600">({stats.pointsRemoved.count} fois)</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-600">Changement net</p>
                <p className={`text-2xl font-bold ${stats.totalPointsChanged >= 0 ? 'text-success-700' : 'text-danger-700'}`}>
                  {stats.totalPointsChanged >= 0 ? '+' : ''}{stats.totalPointsChanged}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Historique des points */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-xl font-bold text-gray-900">
            Historique des modifications
          </h2>
        </div>
        <div className="card-content">
          {history.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 text-4xl mb-4">📊</div>
              <p className="text-gray-600">Aucune modification trouvée</p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((entry) => (
                <div
                  key={entry.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          entry.points > 0 
                            ? 'bg-success-100 text-success-800' 
                            : 'bg-danger-100 text-danger-800'
                        }`}>
                          {entry.points > 0 ? '+' : ''}{entry.points} points
                        </span>
                        <span className="text-sm text-gray-600">
                          par {entry.modifiedBy.email}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(entry.createdAt).toLocaleString('fr-FR')}
                        </span>
                      </div>
                      <p className="text-gray-900">{entry.comment}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteHistoryEntry(entry.id)}
                      className="text-gray-400 hover:text-red-600 ml-4"
                      title="Annuler cette modification"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center items-center space-x-4 mt-6">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={!pagination.hasPreviousPage}
                className="btn btn-secondary btn-sm"
              >
                Précédent
              </button>
              <span className="text-sm text-gray-600">
                Page {pagination.currentPage} sur {pagination.totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={!pagination.hasNextPage}
                className="btn btn-secondary btn-sm"
              >
                Suivant
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal d'ajout de points */}
      {showPointsModal && (
        <AddPointsModal
          person={person}
          onClose={() => setShowPointsModal(false)}
          onPointsAdded={handlePointsAdded}
        />
      )}
    </div>
  );
};

export default PersonDetailPage;
