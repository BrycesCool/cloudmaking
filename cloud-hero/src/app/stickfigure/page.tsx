'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import type { Attachment } from '@/types/stickfigure'

interface Joint {
  id: string
  x: number
  y: number
  name: string
}

interface Bone {
  id: string
  from: string
  to: string
}

const defaultJoints: Joint[] = [
  { id: 'head', x: 200, y: 80, name: 'Head' },
  { id: 'neck', x: 200, y: 120, name: 'Neck' },
  { id: 'shoulder_l', x: 160, y: 130, name: 'L Shoulder' },
  { id: 'shoulder_r', x: 240, y: 130, name: 'R Shoulder' },
  { id: 'elbow_l', x: 130, y: 160, name: 'L Elbow' },
  { id: 'elbow_r', x: 270, y: 160, name: 'R Elbow' },
  { id: 'hand_l', x: 110, y: 200, name: 'L Hand' },
  { id: 'hand_r', x: 290, y: 200, name: 'R Hand' },
  { id: 'hip', x: 200, y: 200, name: 'Hip' },
  { id: 'hip_l', x: 180, y: 210, name: 'L Hip' },
  { id: 'hip_r', x: 220, y: 210, name: 'R Hip' },
  { id: 'knee_l', x: 170, y: 280, name: 'L Knee' },
  { id: 'knee_r', x: 230, y: 280, name: 'R Knee' },
  { id: 'foot_l', x: 160, y: 350, name: 'L Foot' },
  { id: 'foot_r', x: 240, y: 350, name: 'R Foot' },
]

const defaultBones: Bone[] = [
  { id: 'spine_upper', from: 'neck', to: 'hip' },
  { id: 'shoulder_l_bone', from: 'neck', to: 'shoulder_l' },
  { id: 'shoulder_r_bone', from: 'neck', to: 'shoulder_r' },
  { id: 'arm_upper_l', from: 'shoulder_l', to: 'elbow_l' },
  { id: 'arm_upper_r', from: 'shoulder_r', to: 'elbow_r' },
  { id: 'arm_lower_l', from: 'elbow_l', to: 'hand_l' },
  { id: 'arm_lower_r', from: 'elbow_r', to: 'hand_r' },
  { id: 'hip_l_bone', from: 'hip', to: 'hip_l' },
  { id: 'hip_r_bone', from: 'hip', to: 'hip_r' },
  { id: 'leg_upper_l', from: 'hip_l', to: 'knee_l' },
  { id: 'leg_upper_r', from: 'hip_r', to: 'knee_r' },
  { id: 'leg_lower_l', from: 'knee_l', to: 'foot_l' },
  { id: 'leg_lower_r', from: 'knee_r', to: 'foot_r' },
]

// Preset: Tumbling pose (mid-fall)
const tumblingJoints: Joint[] = [
  { id: 'head', x: 297, y: 137, name: 'Head' },
  { id: 'neck', x: 278, y: 180, name: 'Neck' },
  { id: 'shoulder_l', x: 277, y: 181, name: 'L Shoulder' },
  { id: 'shoulder_r', x: 277, y: 180, name: 'R Shoulder' },
  { id: 'elbow_l', x: 269, y: 245, name: 'L Elbow' },
  { id: 'elbow_r', x: 213, y: 167, name: 'R Elbow' },
  { id: 'hand_l', x: 203, y: 281, name: 'L Hand' },
  { id: 'hand_r', x: 158, y: 105, name: 'R Hand' },
  { id: 'hip', x: 246, y: 224, name: 'Hip' },
  { id: 'hip_l', x: 187, y: 259, name: 'L Hip' },
  { id: 'hip_r', x: 188, y: 260, name: 'R Hip' },
  { id: 'knee_l', x: 160, y: 166, name: 'L Knee' },
  { id: 'knee_r', x: 121, y: 196, name: 'R Knee' },
  { id: 'foot_l', x: 62, y: 144, name: 'L Foot' },
  { id: 'foot_r', x: 64, y: 280, name: 'R Foot' },
]

const tumblingBones: Bone[] = [
  { id: 'spine_upper', from: 'neck', to: 'hip' },
  { id: 'shoulder_l_bone', from: 'neck', to: 'shoulder_l' },
  { id: 'shoulder_r_bone', from: 'neck', to: 'shoulder_r' },
  { id: 'arm_upper_l', from: 'shoulder_l', to: 'elbow_l' },
  { id: 'arm_upper_r', from: 'shoulder_r', to: 'elbow_r' },
  { id: 'arm_lower_l', from: 'elbow_l', to: 'hand_l' },
  { id: 'arm_lower_r', from: 'elbow_r', to: 'hand_r' },
  { id: 'hip_l_bone', from: 'hip', to: 'hip_l' },
  { id: 'hip_r_bone', from: 'hip', to: 'hip_r' },
  { id: 'leg_upper_l', from: 'hip_l', to: 'knee_l' },
  { id: 'leg_upper_r', from: 'hip_r', to: 'knee_r' },
  { id: 'leg_lower_l', from: 'knee_l', to: 'foot_l' },
  { id: 'leg_lower_r', from: 'knee_r', to: 'foot_r' },
  { id: 'head_neck', from: 'head', to: 'shoulder_r' },
]

// Preset: Flailing pose (end of fall, on back)
const flailingJoints: Joint[] = [
  { id: 'head', x: 337, y: 316, name: 'Head' },
  { id: 'neck', x: 288, y: 333, name: 'Neck' },
  { id: 'shoulder_l', x: 263, y: 244, name: 'L Shoulder' },
  { id: 'shoulder_r', x: 306, y: 240, name: 'R Shoulder' },
  { id: 'elbow_l', x: 282, y: 145, name: 'L Elbow' },
  { id: 'elbow_r', x: 323, y: 156, name: 'R Elbow' },
  { id: 'hand_l', x: 302, y: 110, name: 'L Hand' },
  { id: 'hand_r', x: 341, y: 138, name: 'R Hand' },
  { id: 'hip', x: 225, y: 324, name: 'Hip' },
  { id: 'hip_l', x: 192, y: 283, name: 'L Hip' },
  { id: 'hip_r', x: 154, y: 240, name: 'R Hip' },
  { id: 'knee_l', x: 244, y: 156, name: 'L Knee' },
  { id: 'knee_r', x: 155, y: 129, name: 'R Knee' },
  { id: 'foot_l', x: 154, y: 43, name: 'L Foot' },
  { id: 'foot_r', x: 80, y: 5, name: 'R Foot' },
  { id: 'joint_1772331789956', x: 270, y: 330, name: 'Chest' },
]

const flailingBones: Bone[] = [
  { id: 'spine_upper', from: 'neck', to: 'hip' },
  { id: 'shoulder_r_bone', from: 'neck', to: 'shoulder_r' },
  { id: 'arm_upper_l', from: 'shoulder_l', to: 'elbow_l' },
  { id: 'arm_upper_r', from: 'shoulder_r', to: 'elbow_r' },
  { id: 'arm_lower_l', from: 'elbow_l', to: 'hand_l' },
  { id: 'arm_lower_r', from: 'elbow_r', to: 'hand_r' },
  { id: 'hip_l_bone', from: 'hip', to: 'hip_l' },
  { id: 'hip_r_bone', from: 'hip', to: 'hip_r' },
  { id: 'leg_upper_l', from: 'hip_l', to: 'knee_l' },
  { id: 'leg_upper_r', from: 'hip_r', to: 'knee_r' },
  { id: 'leg_lower_l', from: 'knee_l', to: 'foot_l' },
  { id: 'leg_lower_r', from: 'knee_r', to: 'foot_r' },
  { id: 'head_neck', from: 'head', to: 'neck' },
  { id: 'chest_neck', from: 'joint_1772331789956', to: 'neck' },
  { id: 'chest_shoulder', from: 'joint_1772331789956', to: 'shoulder_l' },
]

interface CharacterPreset {
  name: string
  joints: Joint[]
  bones: Bone[]
  headRadius: number
}

interface SavedCharacter {
  id: string
  name: string
  joints: Joint[]
  bones: Bone[]
  headRadius: number
  attachments: Attachment[]
  createdAt: number
}

const presets: CharacterPreset[] = [
  { name: 'Standing', joints: defaultJoints, bones: defaultBones, headRadius: 20 },
  { name: 'Tumbling', joints: tumblingJoints, bones: tumblingBones, headRadius: 35 },
  { name: 'Flailing', joints: flailingJoints, bones: flailingBones, headRadius: 34 },
]

export default function StickFigureEditor() {
  const [joints, setJoints] = useState<Joint[]>(defaultJoints)
  const [bones, setBones] = useState<Bone[]>(defaultBones)
  const [selectedJoint, setSelectedJoint] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [addingBone, setAddingBone] = useState<string | null>(null)
  const [showCode, setShowCode] = useState(false)
  const [headRadius, setHeadRadius] = useState(20)
  const [bgImage, setBgImage] = useState<string | null>(null)
  const [bgOpacity, setBgOpacity] = useState(0.5)
  const [bgScale, setBgScale] = useState(100)
  const [bgX, setBgX] = useState(0)
  const [bgY, setBgY] = useState(0)
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [selectedAttachment, setSelectedAttachment] = useState<string | null>(null)
  const [attachToJoint, setAttachToJoint] = useState<string>('shoulder_l')
  const [savedCharacters, setSavedCharacters] = useState<SavedCharacter[]>([])
  const [characterName, setCharacterName] = useState<string>('')
  const [currentCharacterId, setCurrentCharacterId] = useState<string | null>(null)
  const [showCompareView, setShowCompareView] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playIndex, setPlayIndex] = useState(0)
  const [playSpeed, setPlaySpeed] = useState(200) // ms per frame
  const svgRef = useRef<SVGSVGElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const attachmentInputRef = useRef<HTMLInputElement>(null)

  const clearAllCharacters = () => {
    if (confirm('Are you sure you want to delete ALL saved characters? This cannot be undone.')) {
      setSavedCharacters([])
      setCurrentCharacterId(null)
    }
  }

  // Playback animation loop
  useEffect(() => {
    if (!isPlaying || savedCharacters.length === 0) return

    const interval = setInterval(() => {
      setPlayIndex(prev => (prev + 1) % savedCharacters.length)
    }, playSpeed)

    return () => clearInterval(interval)
  }, [isPlaying, savedCharacters.length, playSpeed])

  const togglePlay = () => {
    if (savedCharacters.length === 0) {
      alert('No saved characters to play!')
      return
    }
    setIsPlaying(!isPlaying)
    if (!isPlaying) {
      setPlayIndex(0)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setBgImage(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeBackground = () => {
    setBgImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleAttachmentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const newAttachment: Attachment = {
          id: `attachment_${Date.now()}`,
          jointId: attachToJoint,
          imageData: event.target?.result as string,
          offsetX: 0,
          offsetY: 0,
          scale: 1,
          rotation: 0,
          rotationX: 0,
          rotationY: 0,
          zIndex: -1, // Behind body by default
        }
        setAttachments([...attachments, newAttachment])
        setSelectedAttachment(newAttachment.id)
      }
      reader.readAsDataURL(file)
    }
    if (attachmentInputRef.current) {
      attachmentInputRef.current.value = ''
    }
  }

  const updateAttachment = (id: string, updates: Partial<Attachment>) => {
    setAttachments(attachments.map(a =>
      a.id === id ? { ...a, ...updates } : a
    ))
  }

  const deleteAttachment = (id: string) => {
    setAttachments(attachments.filter(a => a.id !== id))
    if (selectedAttachment === id) {
      setSelectedAttachment(null)
    }
  }

  const saveConfiguration = () => {
    const config = {
      attachments,
      headRadius,
    }
    localStorage.setItem('stickfigure-config', JSON.stringify(config))
    alert('Configuration saved!')
  }

  const loadConfiguration = () => {
    const saved = localStorage.getItem('stickfigure-config')
    if (saved) {
      const config = JSON.parse(saved)
      if (config.attachments) setAttachments(config.attachments)
      if (config.headRadius) setHeadRadius(config.headRadius)
      alert('Configuration loaded!')
    } else {
      alert('No saved configuration found')
    }
  }

  const loadPreset = (preset: CharacterPreset) => {
    setJoints([...preset.joints])
    setBones([...preset.bones])
    setHeadRadius(preset.headRadius)
    setSelectedJoint(null)
    setCurrentCharacterId(null)
  }

  const saveCharacter = () => {
    const name = characterName.trim() || `Character ${savedCharacters.length + 1}`
    const newCharacter: SavedCharacter = {
      id: `char_${Date.now()}`,
      name,
      joints: [...joints],
      bones: [...bones],
      headRadius,
      attachments: [...attachments],
      createdAt: Date.now(),
    }
    setSavedCharacters([...savedCharacters, newCharacter])
    setCurrentCharacterId(newCharacter.id)
    setCharacterName('')
    alert(`Character "${name}" saved!`)
  }

  const loadCharacter = (char: SavedCharacter) => {
    setJoints([...char.joints])
    setBones([...char.bones])
    setHeadRadius(char.headRadius)
    setAttachments([...char.attachments])
    setCurrentCharacterId(char.id)
    setSelectedJoint(null)
    setSelectedAttachment(null)
  }

  const updateCurrentCharacter = () => {
    if (!currentCharacterId) {
      alert('No character selected. Save as new character first.')
      return
    }
    setSavedCharacters(savedCharacters.map(char =>
      char.id === currentCharacterId
        ? { ...char, joints: [...joints], bones: [...bones], headRadius, attachments: [...attachments] }
        : char
    ))
    alert('Character updated!')
  }

  const deleteCharacter = (id: string) => {
    setSavedCharacters(savedCharacters.filter(char => char.id !== id))
    if (currentCharacterId === id) {
      setCurrentCharacterId(null)
    }
  }

  const duplicateCharacter = (char: SavedCharacter) => {
    const newCharacter: SavedCharacter = {
      ...char,
      id: `char_${Date.now()}`,
      name: `${char.name} (copy)`,
      joints: [...char.joints],
      bones: [...char.bones],
      attachments: [...char.attachments],
      createdAt: Date.now(),
    }
    setSavedCharacters([...savedCharacters, newCharacter])
  }

  const getJointById = (id: string) => joints.find(j => j.id === id)

  const handleMouseDown = (jointId: string, e: React.MouseEvent) => {
    e.preventDefault()
    if (addingBone) {
      // Complete the bone connection
      if (addingBone !== jointId) {
        const newBone: Bone = {
          id: `bone_${Date.now()}`,
          from: addingBone,
          to: jointId,
        }
        setBones([...bones, newBone])
      }
      setAddingBone(null)
    } else {
      setSelectedJoint(jointId)
      setIsDragging(true)
    }
  }

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !selectedJoint || !svgRef.current) return

    const svg = svgRef.current
    const rect = svg.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setJoints(prev =>
      prev.map(joint =>
        joint.id === selectedJoint
          ? { ...joint, x: Math.round(x), y: Math.round(y) }
          : joint
      )
    )
  }, [isDragging, selectedJoint])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  const addJoint = () => {
    const newJoint: Joint = {
      id: `joint_${Date.now()}`,
      x: 200,
      y: 200,
      name: `Joint ${joints.length + 1}`,
    }
    setJoints([...joints, newJoint])
  }

  const deleteJoint = (jointId: string) => {
    setJoints(joints.filter(j => j.id !== jointId))
    setBones(bones.filter(b => b.from !== jointId && b.to !== jointId))
    setSelectedJoint(null)
  }

  const deleteBone = (boneId: string) => {
    setBones(bones.filter(b => b.id !== boneId))
  }

  const startAddingBone = (jointId: string) => {
    setAddingBone(jointId)
  }

  const generateCode = () => {
    // Find the center of the figure to normalize coordinates
    const centerX = joints.reduce((sum, j) => sum + j.x, 0) / joints.length
    const centerY = joints.reduce((sum, j) => sum + j.y, 0) / joints.length

    // Find head joint for head circle
    const headJoint = joints.find(j => j.id === 'head')
    const neckJoint = joints.find(j => j.id === 'neck')

    let code = `// Stick Figure SVG Code
// Generated from editor

<svg width="400" height="500" viewBox="0 0 400 500">
  {/* Head */}
  <circle
    cx="${headJoint?.x || 200}"
    cy="${headJoint?.y || 80}"
    r="${headRadius}"
    fill="none"
    stroke="white"
    strokeWidth="2"
  />

  {/* Bones/Lines */}
`

    bones.forEach(bone => {
      const fromJoint = getJointById(bone.from)
      const toJoint = getJointById(bone.to)
      if (fromJoint && toJoint) {
        code += `  <line
    x1="${fromJoint.x}"
    y1="${fromJoint.y}"
    x2="${toJoint.x}"
    y2="${toJoint.y}"
    stroke="white"
    strokeWidth="2"
    strokeLinecap="round"
  />
`
      }
    })

    code += `</svg>`

    // Also generate relative coordinates version
    code += `

// -------- RELATIVE VERSION (centered at 0,0) --------
// Use this for components where you need relative positioning

const joints = {
${joints.map(j => `  ${j.id}: { x: ${Math.round(j.x - centerX)}, y: ${Math.round(j.y - centerY)} },`).join('\n')}
}

const bones = [
${bones.map(b => `  { from: '${b.from}', to: '${b.to}' },`).join('\n')}
]

// Head radius: ${headRadius}
`

    // Add attachments if any exist
    if (attachments.length > 0) {
      code += `
// -------- ATTACHMENTS --------
// Images attached to joints (base64 encoded)

const attachments = [
${attachments.map(att => `  {
    id: '${att.id}',
    jointId: '${att.jointId}',
    imageData: '${att.imageData}',
    offsetX: ${att.offsetX},
    offsetY: ${att.offsetY},
    scale: ${att.scale},
    rotation: ${att.rotation},
    rotationX: ${att.rotationX ?? 0},
    rotationY: ${att.rotationY ?? 0},
    zIndex: ${att.zIndex},
  },`).join('\n')}
]
`
    }

    return code
  }

  // Helper to render a mini preview of a character
  const renderMiniCharacter = (char: SavedCharacter, size: number = 80) => {
    const headJoint = char.joints.find(j => j.id === 'head')
    // Calculate bounds to center the preview
    const minX = Math.min(...char.joints.map(j => j.x))
    const maxX = Math.max(...char.joints.map(j => j.x))
    const minY = Math.min(...char.joints.map(j => j.y))
    const maxY = Math.max(...char.joints.map(j => j.y))
    const width = maxX - minX + 40
    const height = maxY - minY + 40
    const viewBox = `${minX - 20} ${minY - 20} ${width} ${height}`

    return (
      <svg width={size} height={size} viewBox={viewBox} style={{ backgroundColor: '#16213e', borderRadius: '4px' }}>
        {/* Attachments behind */}
        {char.attachments.filter(a => a.zIndex < 0).map(att => {
          const joint = char.joints.find(j => j.id === att.jointId)
          if (!joint) return null
          return (
            <image
              key={att.id}
              href={att.imageData}
              x={joint.x + att.offsetX - 25}
              y={joint.y + att.offsetY - 25}
              width="50"
              height="50"
              preserveAspectRatio="xMidYMid meet"
              style={{ transform: `rotate(${att.rotation}deg) scale(${att.scale})`, transformOrigin: 'center' }}
            />
          )
        })}
        {/* Head */}
        {headJoint && (
          <circle cx={headJoint.x} cy={headJoint.y} r={char.headRadius * 0.8} fill="none" stroke="white" strokeWidth="1.5" />
        )}
        {/* Bones */}
        {char.bones.map(bone => {
          const from = char.joints.find(j => j.id === bone.from)
          const to = char.joints.find(j => j.id === bone.to)
          if (!from || !to) return null
          return <line key={bone.id} x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="white" strokeWidth="1.5" />
        })}
        {/* Attachments in front */}
        {char.attachments.filter(a => a.zIndex > 0).map(att => {
          const joint = char.joints.find(j => j.id === att.jointId)
          if (!joint) return null
          return (
            <image
              key={att.id}
              href={att.imageData}
              x={joint.x + att.offsetX - 25}
              y={joint.y + att.offsetY - 25}
              width="50"
              height="50"
              preserveAspectRatio="xMidYMid meet"
            />
          )
        })}
      </svg>
    )
  }

  const loadPreviousCharacter = () => {
    if (savedCharacters.length === 0) {
      alert('No saved characters to copy from')
      return
    }
    const lastChar = savedCharacters[savedCharacters.length - 1]
    // Load the character but don't set it as current (so we can save as new)
    setJoints([...lastChar.joints])
    setBones([...lastChar.bones])
    setHeadRadius(lastChar.headRadius)
    setAttachments([...lastChar.attachments])
    setCurrentCharacterId(null) // Don't mark as editing existing
    setSelectedJoint(null)
    setSelectedAttachment(null)
  }

  // Get adjacent characters for comparison view
  const getCurrentIndex = () => {
    if (!currentCharacterId) return -1
    return savedCharacters.findIndex(c => c.id === currentCharacterId)
  }

  const getPreviousCharacter = () => {
    const idx = getCurrentIndex()
    if (idx > 0) return savedCharacters[idx - 1]
    return null
  }

  const getNextCharacter = () => {
    const idx = getCurrentIndex()
    if (idx >= 0 && idx < savedCharacters.length - 1) return savedCharacters[idx + 1]
    return null
  }

  // Render a larger preview for comparison
  const renderCompareCharacter = (char: SavedCharacter | null, label: string, isCurrent: boolean = false) => {
    const size = 200

    if (!char) {
      return (
        <div style={{
          width: size,
          height: size + 30,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>{label}</div>
          <div style={{
            width: size,
            height: size,
            backgroundColor: '#16213e',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#444',
            fontSize: '14px',
            border: '2px dashed #333',
          }}>
            No frame
          </div>
        </div>
      )
    }

    const headJoint = char.joints.find(j => j.id === 'head')
    const minX = Math.min(...char.joints.map(j => j.x))
    const maxX = Math.max(...char.joints.map(j => j.x))
    const minY = Math.min(...char.joints.map(j => j.y))
    const maxY = Math.max(...char.joints.map(j => j.y))
    const width = maxX - minX + 60
    const height = maxY - minY + 60
    const viewBox = `${minX - 30} ${minY - 30} ${width} ${height}`

    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        opacity: isCurrent ? 1 : 0.5,
      }}>
        <div style={{
          fontSize: '12px',
          color: isCurrent ? '#4a90d9' : '#888',
          marginBottom: '8px',
          fontWeight: isCurrent ? 'bold' : 'normal',
        }}>
          {label}: {char.name}
        </div>
        <svg
          width={size}
          height={size}
          viewBox={viewBox}
          style={{
            backgroundColor: '#16213e',
            borderRadius: '8px',
            border: isCurrent ? '2px solid #4a90d9' : '2px solid #333',
          }}
        >
          {/* Attachments behind */}
          {char.attachments.filter(a => a.zIndex < 0).map(att => {
            const joint = char.joints.find(j => j.id === att.jointId)
            if (!joint) return null
            const rotX = att.rotationX ?? 0
            const rotY = att.rotationY ?? 0
            return (
              <g key={att.id} transform={`translate(${joint.x + att.offsetX}, ${joint.y + att.offsetY})`}>
                <image
                  href={att.imageData}
                  x="-50"
                  y="-50"
                  width="100"
                  height="100"
                  preserveAspectRatio="xMidYMid meet"
                  style={{
                    transformOrigin: 'center center',
                    transformBox: 'fill-box',
                    transform: `rotateX(${rotX}deg) rotateY(${rotY}deg) rotateZ(${att.rotation}deg) scale(${att.scale})`,
                  }}
                />
              </g>
            )
          })}
          {/* Head */}
          {headJoint && (
            <circle cx={headJoint.x} cy={headJoint.y} r={char.headRadius} fill="none" stroke="white" strokeWidth="2" />
          )}
          {/* Bones */}
          {char.bones.map(bone => {
            const from = char.joints.find(j => j.id === bone.from)
            const to = char.joints.find(j => j.id === bone.to)
            if (!from || !to) return null
            return <line key={bone.id} x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="white" strokeWidth="2" />
          })}
          {/* Attachments in front */}
          {char.attachments.filter(a => a.zIndex > 0).map(att => {
            const joint = char.joints.find(j => j.id === att.jointId)
            if (!joint) return null
            const rotX = att.rotationX ?? 0
            const rotY = att.rotationY ?? 0
            return (
              <g key={att.id} transform={`translate(${joint.x + att.offsetX}, ${joint.y + att.offsetY})`}>
                <image
                  href={att.imageData}
                  x="-50"
                  y="-50"
                  width="100"
                  height="100"
                  preserveAspectRatio="xMidYMid meet"
                  style={{
                    transformOrigin: 'center center',
                    transformBox: 'fill-box',
                    transform: `rotateX(${rotX}deg) rotateY(${rotY}deg) rotateZ(${att.rotation}deg) scale(${att.scale})`,
                  }}
                />
              </g>
            )
          })}
        </svg>
      </div>
    )
  }

  // Create a "virtual" current character from the editor state for comparison
  const getCurrentEditorAsCharacter = (): SavedCharacter => ({
    id: 'current-editor',
    name: 'Current',
    joints: joints,
    bones: bones,
    headRadius: headRadius,
    attachments: attachments,
    createdAt: Date.now(),
  })

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#1a1a2e',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Storyboard Strip */}
      {savedCharacters.length > 0 && (
        <div style={{
          padding: '15px 20px',
          backgroundColor: '#0d0d1a',
          borderBottom: '1px solid #333',
          display: 'flex',
          alignItems: 'center',
          gap: '15px',
          overflowX: 'auto',
        }}>
          <div style={{ fontSize: '12px', color: '#888', minWidth: '80px' }}>Storyboard:</div>
          {savedCharacters.map((char, index) => (
            <div
              key={char.id}
              onClick={() => loadCharacter(char)}
              style={{
                cursor: 'pointer',
                border: currentCharacterId === char.id ? '2px solid #4a90d9' : '2px solid transparent',
                borderRadius: '6px',
                padding: '4px',
                backgroundColor: '#1a1a2e',
                minWidth: '90px',
              }}
            >
              <div style={{ fontSize: '10px', color: '#888', marginBottom: '4px', textAlign: 'center' }}>
                {index + 1}. {char.name.slice(0, 10)}
              </div>
              {renderMiniCharacter(char, 80)}
            </div>
          ))}
          <button
            onClick={loadPreviousCharacter}
            style={{
              padding: '10px 15px',
              backgroundColor: '#e67e22',
              border: 'none',
              borderRadius: '5px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '11px',
              minWidth: '80px',
              height: '80px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '5px',
            }}
          >
            <span style={{ fontSize: '20px' }}>+</span>
            <span>Use Previous</span>
          </button>
          <button
            onClick={() => setShowCompareView(!showCompareView)}
            style={{
              padding: '10px 15px',
              backgroundColor: showCompareView ? '#4a90d9' : '#8e44ad',
              border: 'none',
              borderRadius: '5px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '11px',
              minWidth: '80px',
              height: '80px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '5px',
            }}
          >
            <span style={{ fontSize: '16px' }}>◀ ● ▶</span>
            <span>{showCompareView ? 'Hide Compare' : 'Compare'}</span>
          </button>
          <button
            onClick={togglePlay}
            style={{
              padding: '10px 15px',
              backgroundColor: isPlaying ? '#e74c3c' : '#27ae60',
              border: 'none',
              borderRadius: '5px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '11px',
              minWidth: '80px',
              height: '80px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '5px',
            }}
          >
            <span style={{ fontSize: '24px' }}>{isPlaying ? '■' : '▶'}</span>
            <span>{isPlaying ? 'Stop' : 'Play'}</span>
          </button>
        </div>
      )}

      {/* 3-Panel Comparison View */}
      {showCompareView && (
        <div style={{
          padding: '20px',
          backgroundColor: '#0d0d1a',
          borderBottom: '1px solid #333',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          gap: '30px',
        }}>
          {renderCompareCharacter(getPreviousCharacter(), 'Previous')}
          {renderCompareCharacter(getCurrentEditorAsCharacter(), 'Current', true)}
          {renderCompareCharacter(getNextCharacter(), 'Next')}
        </div>
      )}

      {/* Playback Overlay */}
      {isPlaying && savedCharacters.length > 0 && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setIsPlaying(false)}
        >
          {/* Frame counter */}
          <div style={{
            position: 'absolute',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            color: 'white',
            fontSize: '18px',
            fontWeight: 'bold',
          }}>
            Frame {playIndex + 1} / {savedCharacters.length}: {savedCharacters[playIndex]?.name}
          </div>

          {/* Speed controls */}
          <div style={{
            position: 'absolute',
            top: '60px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
          }}
          onClick={(e) => e.stopPropagation()}
          >
            <span style={{ color: '#888', fontSize: '14px' }}>Speed:</span>
            <button
              onClick={() => setPlaySpeed(Math.min(1000, playSpeed + 50))}
              style={{
                padding: '5px 15px',
                backgroundColor: '#4a4a6e',
                border: 'none',
                borderRadius: '5px',
                color: 'white',
                cursor: 'pointer',
              }}
            >
              Slower
            </button>
            <span style={{ color: 'white', fontSize: '14px', minWidth: '60px', textAlign: 'center' }}>
              {playSpeed}ms
            </span>
            <button
              onClick={() => setPlaySpeed(Math.max(50, playSpeed - 50))}
              style={{
                padding: '5px 15px',
                backgroundColor: '#4a4a6e',
                border: 'none',
                borderRadius: '5px',
                color: 'white',
                cursor: 'pointer',
              }}
            >
              Faster
            </button>
          </div>

          {/* Animation preview */}
          {(() => {
            const char = savedCharacters[playIndex]
            if (!char) return null
            const headJoint = char.joints.find(j => j.id === 'head')
            const minX = Math.min(...char.joints.map(j => j.x))
            const maxX = Math.max(...char.joints.map(j => j.x))
            const minY = Math.min(...char.joints.map(j => j.y))
            const maxY = Math.max(...char.joints.map(j => j.y))
            const width = maxX - minX + 100
            const height = maxY - minY + 100
            const viewBox = `${minX - 50} ${minY - 50} ${width} ${height}`

            return (
              <svg
                width="400"
                height="400"
                viewBox={viewBox}
                style={{
                  backgroundColor: '#16213e',
                  borderRadius: '12px',
                  border: '3px solid #4a90d9',
                }}
              >
                {/* Attachments behind */}
                {char.attachments.filter(a => a.zIndex < 0).map(att => {
                  const joint = char.joints.find(j => j.id === att.jointId)
                  if (!joint) return null
                  const rotX = att.rotationX ?? 0
                  const rotY = att.rotationY ?? 0
                  return (
                    <g key={att.id} transform={`translate(${joint.x + att.offsetX}, ${joint.y + att.offsetY})`}>
                      <image
                        href={att.imageData}
                        x="-50"
                        y="-50"
                        width="100"
                        height="100"
                        preserveAspectRatio="xMidYMid meet"
                        style={{
                          transformOrigin: 'center center',
                          transformBox: 'fill-box',
                          transform: `rotateX(${rotX}deg) rotateY(${rotY}deg) rotateZ(${att.rotation}deg) scale(${att.scale})`,
                        }}
                      />
                    </g>
                  )
                })}
                {/* Head */}
                {headJoint && (
                  <circle cx={headJoint.x} cy={headJoint.y} r={char.headRadius} fill="none" stroke="white" strokeWidth="3" />
                )}
                {/* Bones */}
                {char.bones.map(bone => {
                  const from = char.joints.find(j => j.id === bone.from)
                  const to = char.joints.find(j => j.id === bone.to)
                  if (!from || !to) return null
                  return <line key={bone.id} x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="white" strokeWidth="3" />
                })}
                {/* Attachments in front */}
                {char.attachments.filter(a => a.zIndex > 0).map(att => {
                  const joint = char.joints.find(j => j.id === att.jointId)
                  if (!joint) return null
                  const rotX = att.rotationX ?? 0
                  const rotY = att.rotationY ?? 0
                  return (
                    <g key={att.id} transform={`translate(${joint.x + att.offsetX}, ${joint.y + att.offsetY})`}>
                      <image
                        href={att.imageData}
                        x="-50"
                        y="-50"
                        width="100"
                        height="100"
                        preserveAspectRatio="xMidYMid meet"
                        style={{
                          transformOrigin: 'center center',
                          transformBox: 'fill-box',
                          transform: `rotateX(${rotX}deg) rotateY(${rotY}deg) rotateZ(${att.rotation}deg) scale(${att.scale})`,
                        }}
                      />
                    </g>
                  )
                })}
              </svg>
            )
          })()}

          {/* Instructions */}
          <div style={{
            position: 'absolute',
            bottom: '30px',
            color: '#666',
            fontSize: '14px',
          }}>
            Click anywhere to stop
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flex: 1 }}>
        {/* Sidebar */}
        <div style={{
          width: '300px',
          padding: '20px',
          borderRight: '1px solid #333',
          overflowY: 'auto',
          height: savedCharacters.length > 0 ? 'calc(100vh - 130px)' : '100vh',
        }}>
          <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>Stick Figure Editor</h1>

        <div style={{ marginBottom: '20px' }}>
          <button
            onClick={addJoint}
            style={{
              padding: '10px 20px',
              backgroundColor: '#4a90d9',
              border: 'none',
              borderRadius: '5px',
              color: 'white',
              cursor: 'pointer',
              marginRight: '10px',
            }}
          >
            + Add Joint
          </button>
          <button
            onClick={() => setShowCode(!showCode)}
            style={{
              padding: '10px 20px',
              backgroundColor: '#2ecc71',
              border: 'none',
              borderRadius: '5px',
              color: 'white',
              cursor: 'pointer',
            }}
          >
            {showCode ? 'Hide Code' : 'Export Code'}
          </button>
        </div>

        {/* Character Presets */}
        <div style={{
          marginBottom: '20px',
          padding: '15px',
          backgroundColor: '#2a2a4e',
          borderRadius: '8px',
        }}>
          <h3 style={{ marginBottom: '10px', fontSize: '14px' }}>Character Presets</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {presets.map((preset) => (
              <button
                key={preset.name}
                onClick={() => loadPreset(preset)}
                style={{
                  padding: '10px 15px',
                  backgroundColor: '#6c5ce7',
                  border: 'none',
                  borderRadius: '5px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '12px',
                  textAlign: 'left',
                }}
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        {/* Saved Characters */}
        <div style={{
          marginBottom: '20px',
          padding: '15px',
          backgroundColor: '#2a2a4e',
          borderRadius: '8px',
        }}>
          <h3 style={{ marginBottom: '10px', fontSize: '14px' }}>
            Saved Characters {currentCharacterId && <span style={{ color: '#4a90d9' }}>(editing)</span>}
          </h3>

          {/* Save new character */}
          <div style={{ marginBottom: '10px' }}>
            <input
              type="text"
              placeholder="Character name..."
              value={characterName}
              onChange={(e) => setCharacterName(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                backgroundColor: '#1a1a2e',
                border: '1px solid #4a4a6e',
                borderRadius: '5px',
                color: 'white',
                fontSize: '12px',
                marginBottom: '8px',
              }}
            />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={saveCharacter}
                style={{
                  flex: 1,
                  padding: '8px',
                  backgroundColor: '#27ae60',
                  border: 'none',
                  borderRadius: '5px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '11px',
                }}
              >
                Save New
              </button>
              {currentCharacterId && (
                <button
                  onClick={updateCurrentCharacter}
                  style={{
                    flex: 1,
                    padding: '8px',
                    backgroundColor: '#f39c12',
                    border: 'none',
                    borderRadius: '5px',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '11px',
                  }}
                >
                  Update Current
                </button>
              )}
            </div>
          </div>

          {/* List of saved characters */}
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {savedCharacters.length === 0 ? (
              <div style={{ color: '#666', fontSize: '12px', textAlign: 'center', padding: '10px' }}>
                No saved characters yet
              </div>
            ) : (
              savedCharacters.map(char => (
                <div
                  key={char.id}
                  style={{
                    padding: '8px',
                    backgroundColor: currentCharacterId === char.id ? '#4a90d9' : '#1a1a2e',
                    marginBottom: '5px',
                    borderRadius: '5px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{char.name}</span>
                    <span style={{ fontSize: '10px', color: '#888' }}>
                      {char.attachments.length} att.
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      onClick={() => loadCharacter(char)}
                      style={{
                        flex: 1,
                        padding: '4px 8px',
                        backgroundColor: '#3498db',
                        border: 'none',
                        borderRadius: '3px',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '10px',
                      }}
                    >
                      Load
                    </button>
                    <button
                      onClick={() => duplicateCharacter(char)}
                      style={{
                        flex: 1,
                        padding: '4px 8px',
                        backgroundColor: '#9b59b6',
                        border: 'none',
                        borderRadius: '3px',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '10px',
                      }}
                    >
                      Copy
                    </button>
                    <button
                      onClick={() => deleteCharacter(char.id)}
                      style={{
                        padding: '4px 8px',
                        backgroundColor: '#e74c3c',
                        border: 'none',
                        borderRadius: '3px',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '10px',
                      }}
                    >
                      X
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Head Radius: {headRadius}</label>
          <input
            type="range"
            min="10"
            max="50"
            value={headRadius}
            onChange={(e) => setHeadRadius(Number(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        {/* Background Image Controls */}
        <div style={{
          marginBottom: '20px',
          padding: '15px',
          backgroundColor: '#2a2a4e',
          borderRadius: '8px',
        }}>
          <h3 style={{ marginBottom: '10px', fontSize: '14px' }}>Background Image</h3>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={{ display: 'none' }}
          />
          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                padding: '8px 15px',
                backgroundColor: '#3498db',
                border: 'none',
                borderRadius: '5px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '12px',
                flex: 1,
              }}
            >
              Upload Image
            </button>
            {bgImage && (
              <button
                onClick={removeBackground}
                style={{
                  padding: '8px 15px',
                  backgroundColor: '#e74c3c',
                  border: 'none',
                  borderRadius: '5px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '12px',
                }}
              >
                Remove
              </button>
            )}
          </div>

          {bgImage && (
            <>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '3px', fontSize: '12px' }}>
                  Opacity: {Math.round(bgOpacity * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={bgOpacity * 100}
                  onChange={(e) => setBgOpacity(Number(e.target.value) / 100)}
                  style={{ width: '100%' }}
                />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '3px', fontSize: '12px' }}>
                  Scale: {bgScale}%
                </label>
                <input
                  type="range"
                  min="10"
                  max="300"
                  value={bgScale}
                  onChange={(e) => setBgScale(Number(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '3px', fontSize: '12px' }}>
                  Position X: {bgX}px
                </label>
                <input
                  type="range"
                  min="-500"
                  max="500"
                  value={bgX}
                  onChange={(e) => setBgX(Number(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '3px', fontSize: '12px' }}>
                  Position Y: {bgY}px
                </label>
                <input
                  type="range"
                  min="-500"
                  max="500"
                  value={bgY}
                  onChange={(e) => setBgY(Number(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>
            </>
          )}
        </div>

        {/* Attachments Section */}
        <div style={{
          marginBottom: '20px',
          padding: '15px',
          backgroundColor: '#2a2a4e',
          borderRadius: '8px',
        }}>
          <h3 style={{ marginBottom: '10px', fontSize: '14px' }}>Attachments (Wings, etc.)</h3>
          <input
            ref={attachmentInputRef}
            type="file"
            accept="image/*"
            onChange={handleAttachmentUpload}
            style={{ display: 'none' }}
          />

          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px' }}>
              Attach to joint:
            </label>
            <select
              value={attachToJoint}
              onChange={(e) => setAttachToJoint(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                backgroundColor: '#1a1a2e',
                border: '1px solid #4a4a6e',
                borderRadius: '5px',
                color: 'white',
                fontSize: '12px',
              }}
            >
              {joints.map(j => (
                <option key={j.id} value={j.id}>{j.name}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => attachmentInputRef.current?.click()}
            style={{
              padding: '8px 15px',
              backgroundColor: '#9b59b6',
              border: 'none',
              borderRadius: '5px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '12px',
              width: '100%',
              marginBottom: '10px',
            }}
          >
            + Add Attachment Image
          </button>

          {/* List of attachments */}
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {attachments.map(att => (
              <div
                key={att.id}
                style={{
                  padding: '8px',
                  backgroundColor: selectedAttachment === att.id ? '#4a90d9' : '#1a1a2e',
                  marginBottom: '5px',
                  borderRadius: '5px',
                  cursor: 'pointer',
                }}
                onClick={() => setSelectedAttachment(att.id)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                  <span style={{ fontSize: '12px' }}>
                    On: {getJointById(att.jointId)?.name || att.jointId}
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteAttachment(att.id) }}
                    style={{
                      padding: '2px 6px',
                      backgroundColor: '#e74c3c',
                      border: 'none',
                      borderRadius: '3px',
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: '10px',
                    }}
                  >
                    X
                  </button>
                </div>

                {selectedAttachment === att.id && (
                  <div style={{ marginTop: '10px' }}>
                    <div style={{ marginBottom: '8px' }}>
                      <label style={{ display: 'block', marginBottom: '3px', fontSize: '11px' }}>
                        Joint:
                      </label>
                      <select
                        value={att.jointId}
                        onChange={(e) => updateAttachment(att.id, { jointId: e.target.value })}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          width: '100%',
                          padding: '5px',
                          backgroundColor: '#2a2a4e',
                          border: '1px solid #4a4a6e',
                          borderRadius: '3px',
                          color: 'white',
                          fontSize: '11px',
                        }}
                      >
                        {joints.map(j => (
                          <option key={j.id} value={j.id}>{j.name}</option>
                        ))}
                      </select>
                    </div>

                    <div style={{ marginBottom: '8px' }}>
                      <label style={{ display: 'block', marginBottom: '3px', fontSize: '11px' }}>
                        Offset X: {att.offsetX}px
                      </label>
                      <input
                        type="range"
                        min="-100"
                        max="100"
                        value={att.offsetX}
                        onChange={(e) => updateAttachment(att.id, { offsetX: Number(e.target.value) })}
                        onClick={(e) => e.stopPropagation()}
                        style={{ width: '100%' }}
                      />
                    </div>

                    <div style={{ marginBottom: '8px' }}>
                      <label style={{ display: 'block', marginBottom: '3px', fontSize: '11px' }}>
                        Offset Y: {att.offsetY}px
                      </label>
                      <input
                        type="range"
                        min="-100"
                        max="100"
                        value={att.offsetY}
                        onChange={(e) => updateAttachment(att.id, { offsetY: Number(e.target.value) })}
                        onClick={(e) => e.stopPropagation()}
                        style={{ width: '100%' }}
                      />
                    </div>

                    <div style={{ marginBottom: '8px' }}>
                      <label style={{ display: 'block', marginBottom: '3px', fontSize: '11px' }}>
                        Scale: {Math.round(att.scale * 100)}%
                      </label>
                      <input
                        type="range"
                        min="10"
                        max="300"
                        value={att.scale * 100}
                        onChange={(e) => updateAttachment(att.id, { scale: Number(e.target.value) / 100 })}
                        onClick={(e) => e.stopPropagation()}
                        style={{ width: '100%' }}
                      />
                    </div>

                    <div style={{ marginBottom: '8px' }}>
                      <label style={{ display: 'block', marginBottom: '3px', fontSize: '11px' }}>
                        Rotation Z (spin): {att.rotation}°
                      </label>
                      <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                        <button
                          onClick={(e) => { e.stopPropagation(); updateAttachment(att.id, { rotation: att.rotation - 1 }) }}
                          style={{ padding: '2px 8px', backgroundColor: '#4a4a6e', border: 'none', borderRadius: '3px', color: 'white', cursor: 'pointer', fontSize: '12px' }}
                        >-1</button>
                        <input
                          type="range"
                          min="-180"
                          max="180"
                          value={att.rotation}
                          onChange={(e) => updateAttachment(att.id, { rotation: Number(e.target.value) })}
                          onClick={(e) => e.stopPropagation()}
                          style={{ flex: 1 }}
                        />
                        <button
                          onClick={(e) => { e.stopPropagation(); updateAttachment(att.id, { rotation: att.rotation + 1 }) }}
                          style={{ padding: '2px 8px', backgroundColor: '#4a4a6e', border: 'none', borderRadius: '3px', color: 'white', cursor: 'pointer', fontSize: '12px' }}
                        >+1</button>
                      </div>
                    </div>

                    <div style={{ marginBottom: '8px' }}>
                      <label style={{ display: 'block', marginBottom: '3px', fontSize: '11px' }}>
                        Rotation X (tilt fwd/back): {att.rotationX ?? 0}°
                      </label>
                      <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                        <button
                          onClick={(e) => { e.stopPropagation(); updateAttachment(att.id, { rotationX: (att.rotationX ?? 0) - 1 }) }}
                          style={{ padding: '2px 8px', backgroundColor: '#4a4a6e', border: 'none', borderRadius: '3px', color: 'white', cursor: 'pointer', fontSize: '12px' }}
                        >-1</button>
                        <input
                          type="range"
                          min="-90"
                          max="90"
                          value={att.rotationX ?? 0}
                          onChange={(e) => updateAttachment(att.id, { rotationX: Number(e.target.value) })}
                          onClick={(e) => e.stopPropagation()}
                          style={{ flex: 1 }}
                        />
                        <button
                          onClick={(e) => { e.stopPropagation(); updateAttachment(att.id, { rotationX: (att.rotationX ?? 0) + 1 }) }}
                          style={{ padding: '2px 8px', backgroundColor: '#4a4a6e', border: 'none', borderRadius: '3px', color: 'white', cursor: 'pointer', fontSize: '12px' }}
                        >+1</button>
                      </div>
                    </div>

                    <div style={{ marginBottom: '8px' }}>
                      <label style={{ display: 'block', marginBottom: '3px', fontSize: '11px' }}>
                        Rotation Y (tilt left/right): {att.rotationY ?? 0}°
                      </label>
                      <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                        <button
                          onClick={(e) => { e.stopPropagation(); updateAttachment(att.id, { rotationY: (att.rotationY ?? 0) - 1 }) }}
                          style={{ padding: '2px 8px', backgroundColor: '#4a4a6e', border: 'none', borderRadius: '3px', color: 'white', cursor: 'pointer', fontSize: '12px' }}
                        >-1</button>
                        <input
                          type="range"
                          min="-90"
                          max="90"
                          value={att.rotationY ?? 0}
                          onChange={(e) => updateAttachment(att.id, { rotationY: Number(e.target.value) })}
                          onClick={(e) => e.stopPropagation()}
                          style={{ flex: 1 }}
                        />
                        <button
                          onClick={(e) => { e.stopPropagation(); updateAttachment(att.id, { rotationY: (att.rotationY ?? 0) + 1 }) }}
                          style={{ padding: '2px 8px', backgroundColor: '#4a4a6e', border: 'none', borderRadius: '3px', color: 'white', cursor: 'pointer', fontSize: '12px' }}
                        >+1</button>
                      </div>
                    </div>

                    <div style={{ marginBottom: '8px' }}>
                      <label style={{ display: 'block', marginBottom: '3px', fontSize: '11px' }}>
                        Layer:
                      </label>
                      <div style={{ display: 'flex', gap: '5px' }}>
                        <button
                          onClick={(e) => { e.stopPropagation(); updateAttachment(att.id, { zIndex: -1 }) }}
                          style={{
                            flex: 1,
                            padding: '5px',
                            backgroundColor: att.zIndex < 0 ? '#4a90d9' : '#3a3a5e',
                            border: 'none',
                            borderRadius: '3px',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '10px',
                          }}
                        >
                          Behind
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); updateAttachment(att.id, { zIndex: 1 }) }}
                          style={{
                            flex: 1,
                            padding: '5px',
                            backgroundColor: att.zIndex > 0 ? '#4a90d9' : '#3a3a5e',
                            border: 'none',
                            borderRadius: '3px',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '10px',
                          }}
                        >
                          In Front
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Save/Load Configuration */}
        <div style={{
          marginBottom: '20px',
          padding: '15px',
          backgroundColor: '#2a2a4e',
          borderRadius: '8px',
        }}>
          <h3 style={{ marginBottom: '10px', fontSize: '14px' }}>Save/Load Config</h3>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={saveConfiguration}
              style={{
                flex: 1,
                padding: '8px 15px',
                backgroundColor: '#27ae60',
                border: 'none',
                borderRadius: '5px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              Save
            </button>
            <button
              onClick={loadConfiguration}
              style={{
                flex: 1,
                padding: '8px 15px',
                backgroundColor: '#3498db',
                border: 'none',
                borderRadius: '5px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              Load
            </button>
          </div>
        </div>

        {addingBone && (
          <div style={{
            padding: '10px',
            backgroundColor: '#e74c3c',
            borderRadius: '5px',
            marginBottom: '20px',
          }}>
            Click another joint to connect, or{' '}
            <button onClick={() => setAddingBone(null)} style={{
              background: 'none',
              border: 'none',
              color: 'white',
              textDecoration: 'underline',
              cursor: 'pointer',
            }}>
              cancel
            </button>
          </div>
        )}

        <h3 style={{ marginBottom: '10px' }}>Joints</h3>
        <div style={{ marginBottom: '20px', maxHeight: '200px', overflowY: 'auto' }}>
          {joints.map(joint => (
            <div
              key={joint.id}
              style={{
                padding: '8px',
                backgroundColor: selectedJoint === joint.id ? '#4a90d9' : '#2a2a4e',
                marginBottom: '5px',
                borderRadius: '5px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
              }}
              onClick={() => setSelectedJoint(joint.id)}
            >
              <span>{joint.name} ({joint.x}, {joint.y})</span>
              <div>
                <button
                  onClick={(e) => { e.stopPropagation(); startAddingBone(joint.id) }}
                  style={{
                    padding: '3px 8px',
                    backgroundColor: '#9b59b6',
                    border: 'none',
                    borderRadius: '3px',
                    color: 'white',
                    cursor: 'pointer',
                    marginRight: '5px',
                    fontSize: '12px',
                  }}
                >
                  Connect
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteJoint(joint.id) }}
                  style={{
                    padding: '3px 8px',
                    backgroundColor: '#e74c3c',
                    border: 'none',
                    borderRadius: '3px',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '12px',
                  }}
                >
                  X
                </button>
              </div>
            </div>
          ))}
        </div>

        <h3 style={{ marginBottom: '10px' }}>Bones</h3>
        <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
          {bones.map(bone => (
            <div
              key={bone.id}
              style={{
                padding: '8px',
                backgroundColor: '#2a2a4e',
                marginBottom: '5px',
                borderRadius: '5px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span>{getJointById(bone.from)?.name} → {getJointById(bone.to)?.name}</span>
              <button
                onClick={() => deleteBone(bone.id)}
                style={{
                  padding: '3px 8px',
                  backgroundColor: '#e74c3c',
                  border: 'none',
                  borderRadius: '3px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '12px',
                }}
              >
                X
              </button>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '20px' }}>
          <button
            onClick={() => { setJoints(defaultJoints); setBones(defaultBones); }}
            style={{
              padding: '10px 20px',
              backgroundColor: '#e67e22',
              border: 'none',
              borderRadius: '5px',
              color: 'white',
              cursor: 'pointer',
              width: '100%',
            }}
          >
            Reset to Default
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div style={{ flex: 1, position: 'relative' }}>
        <svg
          ref={svgRef}
          width="100%"
          height="100vh"
          style={{ backgroundColor: '#16213e' }}
        >
          {/* Grid */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#2a2a4e" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Background Image */}
          {bgImage && (
            <image
              href={bgImage}
              x={bgX}
              y={bgY}
              width={`${bgScale}%`}
              height={`${bgScale}%`}
              opacity={bgOpacity}
              preserveAspectRatio="xMidYMid meet"
              style={{ pointerEvents: 'none' }}
            />
          )}

          {/* Attachments BEHIND body (zIndex < 0) */}
          {attachments.filter(a => a.zIndex < 0).map(att => {
            const joint = getJointById(att.jointId)
            if (!joint) return null
            const rotX = att.rotationX ?? 0
            const rotY = att.rotationY ?? 0
            return (
              <g
                key={att.id}
                transform={`translate(${joint.x + att.offsetX}, ${joint.y + att.offsetY})`}
                style={{
                  cursor: 'pointer',
                  outline: selectedAttachment === att.id ? '2px dashed #4a90d9' : 'none',
                }}
                onClick={() => setSelectedAttachment(att.id)}
              >
                <image
                  href={att.imageData}
                  x="-50"
                  y="-50"
                  width="100"
                  height="100"
                  preserveAspectRatio="xMidYMid meet"
                  style={{
                    transformOrigin: 'center center',
                    transformBox: 'fill-box',
                    transform: `rotateX(${rotX}deg) rotateY(${rotY}deg) rotateZ(${att.rotation}deg) scale(${att.scale})`,
                  }}
                />
              </g>
            )
          })}

          {/* Head circle */}
          {joints.find(j => j.id === 'head') && (
            <circle
              cx={joints.find(j => j.id === 'head')!.x}
              cy={joints.find(j => j.id === 'head')!.y}
              r={headRadius}
              fill="none"
              stroke="white"
              strokeWidth="2"
            />
          )}

          {/* Bones */}
          {bones.map(bone => {
            const fromJoint = getJointById(bone.from)
            const toJoint = getJointById(bone.to)
            if (!fromJoint || !toJoint) return null
            return (
              <line
                key={bone.id}
                x1={fromJoint.x}
                y1={fromJoint.y}
                x2={toJoint.x}
                y2={toJoint.y}
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
              />
            )
          })}

          {/* Adding bone preview */}
          {addingBone && getJointById(addingBone) && (
            <line
              x1={getJointById(addingBone)!.x}
              y1={getJointById(addingBone)!.y}
              x2={getJointById(addingBone)!.x}
              y2={getJointById(addingBone)!.y}
              stroke="#9b59b6"
              strokeWidth="2"
              strokeDasharray="5,5"
            />
          )}

          {/* Joints */}
          {joints.map(joint => (
            <g key={joint.id}>
              <circle
                cx={joint.x}
                cy={joint.y}
                r="10"
                fill={selectedJoint === joint.id ? '#4a90d9' : addingBone === joint.id ? '#9b59b6' : '#e74c3c'}
                stroke="white"
                strokeWidth="2"
                style={{ cursor: 'grab' }}
                onMouseDown={(e) => handleMouseDown(joint.id, e)}
              />
              <text
                x={joint.x}
                y={joint.y - 15}
                fill="#aaa"
                fontSize="10"
                textAnchor="middle"
              >
                {joint.name}
              </text>
            </g>
          ))}

          {/* Attachments IN FRONT of body (zIndex > 0) */}
          {attachments.filter(a => a.zIndex > 0).map(att => {
            const joint = getJointById(att.jointId)
            if (!joint) return null
            const rotX = att.rotationX ?? 0
            const rotY = att.rotationY ?? 0
            return (
              <g
                key={att.id}
                transform={`translate(${joint.x + att.offsetX}, ${joint.y + att.offsetY})`}
                style={{
                  cursor: 'pointer',
                  outline: selectedAttachment === att.id ? '2px dashed #4a90d9' : 'none',
                }}
                onClick={() => setSelectedAttachment(att.id)}
              >
                <image
                  href={att.imageData}
                  x="-50"
                  y="-50"
                  width="100"
                  height="100"
                  preserveAspectRatio="xMidYMid meet"
                  style={{
                    transformOrigin: 'center center',
                    transformBox: 'fill-box',
                    transform: `rotateX(${rotX}deg) rotateY(${rotY}deg) rotateZ(${att.rotation}deg) scale(${att.scale})`,
                  }}
                />
              </g>
            )
          })}
        </svg>

        {/* Code Export Modal */}
        {showCode && (
          <div style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            width: '500px',
            maxHeight: '80vh',
            backgroundColor: '#1a1a2e',
            border: '1px solid #4a90d9',
            borderRadius: '10px',
            padding: '20px',
            overflowY: 'auto',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
              <h3>Generated Code</h3>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generateCode())
                  alert('Code copied to clipboard!')
                }}
                style={{
                  padding: '5px 15px',
                  backgroundColor: '#2ecc71',
                  border: 'none',
                  borderRadius: '5px',
                  color: 'white',
                  cursor: 'pointer',
                }}
              >
                Copy
              </button>
            </div>
            <pre style={{
              backgroundColor: '#0d0d1a',
              padding: '15px',
              borderRadius: '5px',
              overflow: 'auto',
              fontSize: '12px',
              lineHeight: '1.5',
              whiteSpace: 'pre-wrap',
            }}>
              {generateCode()}
            </pre>
          </div>
        )}
      </div>
      </div>
    </div>
  )
}
