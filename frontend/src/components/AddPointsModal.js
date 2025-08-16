import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import axios from 'axios';
import LoadingSpinner from './LoadingSpinner';

const AddPointsModal = ({ person, onClose, onPointsAdded }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [pointsType, setPointsType] = useState('add'); // 'add' ou 'remove'
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm();

  const pointsValue = watch('points', 0);
  const comment = watch('comment', '');

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const points = pointsType === 'add' ? parseInt(data.points) : -parseInt(data.points);
      
      const response = await axios.post('/points', {
        personId: person.id,
        points: points,
        comment: data.comment
      });

      toast.success(
        pointsType === 'add' 
          ? `${data.points} points ajoutés à ${person.name}` 
          : `${data.points} points retirés de ${person.name}`
      );
      
      onPointsAdded(response.data.person);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la modification des points');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateNewScore = () => {
    const points = parseInt(pointsValue) || 0;
    const change = pointsType === 'add' ? points : -points;
    return person.score + change;
  };

  const newScore = calculateNewScore();
  const isValidScore = newScore >= 0 && newScore <= person.maxScore;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto animate-bounce-in">
        <div className="p-6">
          {/* En-tête */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              Modifier les points
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Informations de la personne */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">{person.name}</h3>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Score actuel:</span>
              <span className="font-medium">{person.score} / {person.maxScore}</span>
            </div>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Type d'action */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Action
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="add"
                    checked={pointsType === 'add'}
                    onChange={(e) => setPointsType(e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-success-600 font-medium">Ajouter des points</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="remove"
                    checked={pointsType === 'remove'}
                    onChange={(e) => setPointsType(e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-danger-600 font-medium">Retirer des points</span>
                </label>
              </div>
            </div>

            {/* Nombre de points */}
            <div>
              <label htmlFor="points" className="block text-sm font-medium text-gray-700">
                Nombre de points
              </label>
              <input
                {...register('points', {
                  required: 'Le nombre de points est requis',
                  min: {
                    value: 1,
                    message: 'Le nombre de points doit être positif'
                  },
                  max: {
                    value: 200,
                    message: 'Le nombre de points ne peut pas dépasser 200'
                  }
                })}
                type="number"
                min="1"
                max="200"
                className="input mt-1"
                placeholder="Entrez le nombre de points"
              />
              {errors.points && (
                <p className="mt-1 text-sm text-red-600">{errors.points.message}</p>
              )}
            </div>

            {/* Aperçu du nouveau score */}
            {pointsValue > 0 && (
              <div className={`p-3 rounded-lg ${isValidScore ? 'bg-blue-50' : 'bg-red-50'}`}>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">
                    Nouveau score:
                  </span>
                  <span className={`font-bold ${isValidScore ? 'text-blue-600' : 'text-red-600'}`}>
                    {person.score} {pointsType === 'add' ? '+' : '-'} {pointsValue} = {newScore}
                  </span>
                </div>
                {!isValidScore && (
                  <p className="text-sm text-red-600 mt-1">
                    {newScore < 0 
                      ? 'Le score ne peut pas être négatif'
                      : `Le score ne peut pas dépasser ${person.maxScore}`
                    }
                  </p>
                )}
              </div>
            )}

            {/* Commentaire */}
            <div>
              <label htmlFor="comment" className="block text-sm font-medium text-gray-700">
                Commentaire
              </label>
              <textarea
                {...register('comment', {
                  required: 'Un commentaire est requis',
                  minLength: {
                    value: 1,
                    message: 'Le commentaire ne peut pas être vide'
                  },
                  maxLength: {
                    value: 500,
                    message: 'Le commentaire ne peut pas dépasser 500 caractères'
                  }
                })}
                rows={3}
                className="input mt-1 resize-none"
                placeholder="Expliquez la raison de cette modification..."
              />
              <div className="flex justify-between mt-1">
                {errors.comment && (
                  <p className="text-sm text-red-600">{errors.comment.message}</p>
                )}
                <p className="text-sm text-gray-500 ml-auto">
                  {comment.length}/500
                </p>
              </div>
            </div>

            {/* Boutons */}
            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                disabled={isLoading || !isValidScore}
                className={`btn btn-lg flex-1 ${
                  pointsType === 'add' ? 'btn-success' : 'btn-danger'
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <LoadingSpinner size="sm" className="mr-2" />
                    Modification...
                  </div>
                ) : (
                  pointsType === 'add' ? 'Ajouter les points' : 'Retirer les points'
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary btn-lg"
                disabled={isLoading}
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddPointsModal;
