export interface Attachment {
  id: string
  jointId: string          // Which joint it's attached to
  imageData: string        // Base64 data URL
  offsetX: number          // Offset from joint center
  offsetY: number
  scale: number            // 1 = 100%
  rotation: number         // Z-axis rotation (spin in place)
  rotationX: number        // X-axis rotation (tilt forward/back)
  rotationY: number        // Y-axis rotation (tilt left/right)
  zIndex: number           // Render order: -1 = behind body, 1 = in front
}

export interface JointPosition {
  x: number
  y: number
}

export interface JointPositions {
  head: JointPosition
  neck: JointPosition
  shoulder_l: JointPosition
  shoulder_r: JointPosition
  elbow_l: JointPosition
  elbow_r: JointPosition
  hand_l: JointPosition
  hand_r: JointPosition
  hip: JointPosition
  hip_l: JointPosition
  hip_r: JointPosition
  knee_l: JointPosition
  knee_r: JointPosition
  foot_l: JointPosition
  foot_r: JointPosition
}

export interface StickFigureConfig {
  joints: JointPositions
  attachments: Attachment[]
}
