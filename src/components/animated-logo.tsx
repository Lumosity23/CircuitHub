'use client'

import { useEffect, useRef, useState } from 'react'

interface AnimatedLogoProps {
  size?: number
  className?: string
  state?: 'idle' | 'loading' | 'sending' | 'angry' | 'scared' | 'clicked'
  onClick?: () => void
}

export function AnimatedLogo({ 
  size = 40, 
  className = '', 
  state = 'idle',
  onClick 
}: AnimatedLogoProps) {
  const headRef = useRef<SVGGElement>(null)
  const eyesRef = useRef<SVGGElement>(null)
  const masterRef = useRef<SVGGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [currentState, setCurrentState] = useState(state)

  useEffect(() => {
    setCurrentState(state)
  }, [state])

  useEffect(() => {
    const head = headRef.current
    const eyes = eyesRef.current
    const container = containerRef.current

    if (!head || !eyes || !container) return

    // Paramètres de mouvement
    const headMoveFactor = 0.05
    const eyesMoveFactor = 0.1
    const maxEyeTravel = 15
    
    // Variables pour le suivi fluide
    let targetX = 0, targetY = 0
    let currentX = 0, currentY = 0
    const smoothing = 0.08

    const handleMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      
      targetX = (event.clientX - centerX)
      targetY = (event.clientY - centerY)
    }

    let animationId: number

    const animate = () => {
      // Lissage du mouvement
      currentX += (targetX - currentX) * smoothing
      currentY += (targetY - currentY) * smoothing
      
      // Mouvement de la tête
      const headX = currentX * headMoveFactor
      const headY = currentY * headMoveFactor
      head.setAttribute('transform', `translate(${headX}, ${headY})`)
      
      // Mouvement des yeux
      const eyesX = currentX * eyesMoveFactor
      const eyesY = currentY * eyesMoveFactor
      
      const clampedEyesX = Math.max(-maxEyeTravel, Math.min(maxEyeTravel, eyesX))
      const clampedEyesY = Math.max(-maxEyeTravel, Math.min(maxEyeTravel, eyesY))
      
      eyes.setAttribute('transform', `translate(${clampedEyesX}, ${clampedEyesY})`)
      
      animationId = requestAnimationFrame(animate)
    }

    window.addEventListener('mousemove', handleMouseMove)
    animate()

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
    }
  }, [])

  const handleClick = () => {
    if (onClick) {
      onClick()
    } else {
      // Animation de clic par défaut
      setCurrentState('clicked')
      setTimeout(() => {
        setCurrentState('idle')
      }, 300)
    }
  }

  const getStateClass = () => {
    switch (currentState) {
      case 'loading': return 'is-loading'
      case 'sending': return 'is-sending'
      case 'angry': return 'is-angry'
      case 'scared': return 'is-scared'
      case 'clicked': return 'is-clicked'
      default: return ''
    }
  }

  return (
    <div 
      ref={containerRef} 
      className={`inline-block cursor-pointer ${className}`} 
      style={{ width: size, height: size }}
      onClick={handleClick}
    >
      <svg width="100%" height="100%" viewBox="-20 -20 240 240" xmlns="http://www.w3.org/2000/svg">
        <style>
          {`
            /* Animation de base (idle) - Saut toutes les 2 secondes - DÉSACTIVÉE */

            @keyframes blink {
              0%, 95%, 100% { transform: scaleY(1); }
              97.5% { transform: scaleY(0.05); }
            }

            .bot-group-anim {
              /* animation: jumpAnimation 2s ease-in-out infinite; */
              transform-origin: center;
            }
            
            .eyes-group-anim {
              animation: blink 7s infinite;
              transform-origin: center;
            }

            /* Animation au clic */
            @keyframes click-pop {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.1); }
            }

            .is-clicked .bot-group-anim {
              animation: click-pop 0.3s ease-out;
            }

            /* Animation de chargement */
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }

            .is-loading .bot-group-anim {
              animation: spin 1.5s linear infinite;
              transform-origin: 100px 100px; /* Centre du bonhomme */
            }

            .is-loading .eyes-group-anim {
              animation: none;
            }

            /* Animation "Envoi" - Looping fluide */
            @keyframes send-loop {
              0% { transform: translateY(0) scale(1) rotate(0deg); opacity: 1; }
              25% { transform: translateY(-30px) scale(0.8) rotate(90deg); opacity: 0.8; }
              50% { transform: translateY(-40px) scale(0.6) rotate(180deg); opacity: 0.3; }
              75% { transform: translateY(-30px) scale(0.8) rotate(270deg); opacity: 0.8; }
              100% { transform: translateY(0) scale(1) rotate(360deg); opacity: 1; }
            }

            .is-sending .bot-group-anim {
              animation: send-loop 1.5s ease-in-out infinite;
              transform-origin: 100px 100px;
            }

            .is-sending .eyes-group-anim {
              animation: none;
            }

            /* Animation "Fâché" */
            @keyframes angry-shake {
              0%, 100% { transform: translateX(0); }
              25% { transform: translateX(-2px); }
              75% { transform: translateX(2px); }
            }

            .is-angry .bot-group-anim {
              animation: angry-shake 0.2s infinite;
            }

            .is-angry #eye-left-${size} {
              transform: rotate(15deg) translateY(4px);
            }

            .is-angry #eye-right-${size} {
              transform: rotate(-15deg) translateY(4px);
            }

            .is-angry .corps {
              filter: drop-shadow(0 0 10px rgba(255, 50, 50, 0.7));
            }

            /* Animation "Peur" */
            @keyframes scared-tremble {
              0% { transform: translate(1px, 1px) rotate(0deg); }
              10% { transform: translate(-1px, -2px) rotate(-1deg); }
              20% { transform: translate(-3px, 0px) rotate(1deg); }
              30% { transform: translate(3px, 2px) rotate(0deg); }
              40% { transform: translate(1px, -1px) rotate(1deg); }
              50% { transform: translate(-1px, 2px) rotate(-1deg); }
              60% { transform: translate(-3px, 1px) rotate(0deg); }
              70% { transform: translate(3px, 1px) rotate(-1deg); }
              80% { transform: translate(-1px, -1px) rotate(1deg); }
              90% { transform: translate(1px, 2px) rotate(0deg); }
              100% { transform: translate(1px, -2px) rotate(-1deg); }
            }

            .is-scared .bot-group-anim {
              animation: scared-tremble 0.8s infinite;
            }

            .is-scared .eyes-group-anim {
              transform: scale(1.1, 1.3);
            }
          `}
        </style>

        <defs>
          <radialGradient id={`bodyGradient-${size}`} cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <stop offset="0%" style={{ stopColor: '#cce7ff' }} />
            <stop offset="60%" style={{ stopColor: '#3399ff' }} />
            <stop offset="100%" style={{ stopColor: '#0055b3' }} />
          </radialGradient>
          
          <filter id={`softGlow-${size}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
          </filter>
        </defs>
        
        <g ref={masterRef} className={getStateClass()}>
          <g ref={headRef}>
            <g className="bot-group-anim">
              {/* Halo extérieur */}
              <circle className="corps" cx="100" cy="100" r="85" fill="#3a4c6a" opacity="0.7" filter={`url(#softGlow-${size})`} />
              
              {/* Corps principal */}
              <circle className="corps" cx="100" cy="100" r="80" fill={`url(#bodyGradient-${size})`} />
              
              {/* Yeux */}
              <g ref={eyesRef}>
                <g className="eyes-group-anim">
                  <rect id={`eye-left-${size}`} x="70" y="86" width="12" height="28" rx="6" ry="6" fill="#ffffff" />
                  <rect id={`eye-right-${size}`} x="118" y="86" width="12" height="28" rx="6" ry="6" fill="#ffffff" />
                </g>
              </g>
            </g>
          </g>
        </g>
      </svg>
    </div>
  )
}