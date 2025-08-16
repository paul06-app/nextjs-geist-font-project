import React from 'react';
import { Link } from 'react-router-dom';

const PersonCard = ({ person, onAddPoints }) => {
  const getScoreColor = (score, maxScore) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'text-success-600';
    if (percentage >= 60) return 'text-yellow-600';
    if (percentage >= 40) return 'text-orange-600';
    return 'text-danger-600';
  };

  const getProgressColor = (score, maxScore) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'bg-success-500';
    if (percentage >= 60) return 'bg-yellow-500';
    if (percentage >= 40) return 'bg-orange-500';
    return 'bg-danger-500';
  };

  const progressPercentage = (person.score / person.maxScore) * 100;

  return (
    <div className="card hover:shadow-md transition-shadow duration-200 animate-fade-in">
      <div className="card-header">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {person.name}
          </h3>
          <div className="flex items-center space-x-2">
            <span className={`text-2xl font-bold ${getScoreColor(person.score, person.maxScore)}`}>
              {person.score}
            </span>
            <span className="text-sm text-gray-500">/ {person.maxScore}</span>
          </div>
        </div>
        
        {/* Barre de progression */}
        <div className="mt-3">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Progression</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(person.score, person.maxScore)}`}
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="card-content">
        <div className="space-y-3">
          {/* Informations supplémentaires */}
          <div className="flex justify-between text-sm text-gray-600">
            <span>Créé par:</span>
            <span className="font-medium">{person.createdBy?.email}</span>
          </div>
          
          <div className="flex justify-between text-sm text-gray-600">
            <span>Modifications:</span>
            <span className="font-medium">{person._count?.pointHistories || 0}</span>
          </div>

          <div className="flex justify-between text-sm text-gray-600">
            <span>Créé le:</span>
            <span className="font-medium">
              {new Date(person.createdAt).toLocaleDateString('fr-FR')}
            </span>
          </div>
        </div>
      </div>

      <div className="card-footer">
        <div className="flex space-x-2 w-full">
          <button
            onClick={onAddPoints}
            className="btn btn-primary btn-sm flex-1"
          >
            Modifier points
          </button>
          <Link
            to={`/person/${person.id}`}
            className="btn btn-secondary btn-sm flex-1 text-center"
          >
            Voir historique
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PersonCard;
