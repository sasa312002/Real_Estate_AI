import React, { useState } from 'react'
import { feedbackAPI } from '../services/api'
import { ThumbsUp, ThumbsDown, ExternalLink, FileText } from 'lucide-react'

function ResponseCard({ response }) {
  const [feedback, setFeedback] = useState(null)
  const [submittingFeedback, setSubmittingFeedback] = useState(false)

  const handleFeedback = async (isPositive) => {
    if (submittingFeedback) return
    
    setSubmittingFeedback(true)
    try {
      const result = await feedbackAPI.submit({
        response_id: response.response_id,
        is_positive: isPositive
      })
      setFeedback(result.data)
    } catch (error) {
      console.error('Failed to submit feedback:', error)
    } finally {
      setSubmittingFeedback(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatPercentage = (value) => {
    return `${(value * 100).toFixed(1)}%`
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
      <h3 className="text-xl font-semibold text-gray-900">Analysis Results</h3>
      
      {/* Price Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Estimated Market Value</h4>
          <div className="text-2xl font-bold text-blue-700">
            {formatCurrency(response.estimated_price)}
          </div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="font-medium text-green-900 mb-2">Location Score</h4>
          <div className="text-2xl font-bold text-green-700">
            {formatPercentage(response.location_score)}
          </div>
        </div>
      </div>

      {/* Provenance */}
      {response.provenance && response.provenance.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 mb-3 flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            Sources & References
          </h4>
          <div className="space-y-2">
            {response.provenance.map((item, index) => (
              <div key={index} className="bg-gray-50 p-3 rounded-md">
                <div className="text-sm font-medium text-gray-900 mb-1">
                  {item.doc_id}
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  {item.snippet}
                </div>
                {item.link && (
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-xs text-primary-600 hover:text-primary-700"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    View Source
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Feedback Section */}
      <div className="border-t pt-4">
        <h4 className="font-medium text-gray-900 mb-3">Was this analysis helpful?</h4>
        <div className="flex space-x-3">
          <button
            onClick={() => handleFeedback(true)}
            disabled={submittingFeedback}
            className={`flex items-center px-4 py-2 rounded-md transition-colors ${
              feedback?.is_positive === true
                ? 'bg-green-100 text-green-700 border border-green-300'
                : 'bg-gray-100 text-gray-700 hover:bg-green-100 hover:text-green-700'
            }`}
          >
            <ThumbsUp className="h-4 w-4 mr-2" />
            Helpful
          </button>
          
          <button
            onClick={() => handleFeedback(false)}
            disabled={submittingFeedback}
            className={`flex items-center px-4 py-2 rounded-md transition-colors ${
              feedback?.is_positive === false
                ? 'bg-red-100 text-red-700 border border-red-300'
                : 'bg-gray-100 text-gray-700 hover:bg-red-100 hover:text-red-700'
            }`}
          >
            <ThumbsDown className="h-4 w-4 mr-2" />
            Not Helpful
          </button>
        </div>
        
        {feedback && (
          <p className="text-sm text-gray-600 mt-2">
            Thank you for your feedback!
          </p>
        )}
      </div>

      {/* Query Info */}
      <div className="text-xs text-gray-500 border-t pt-4">
        <div>Query ID: {response.query_id}</div>
        <div>Response ID: {response.response_id}</div>
      </div>
    </div>
  )
}

export default ResponseCard

