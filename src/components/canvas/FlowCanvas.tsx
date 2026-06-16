'use client';

import { useCallback, useRef } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  type ReactFlowInstance,
  type Node,
  type Edge,
} from '@xyflow/react';
import { useGameStore } from '@/store/useGameStore';
import { ServiceTile } from './nodes/ServiceTile';
import { ConduitEdge } from './edges/ConduitEdge';
import type { ServiceNodeData, ServiceType } from '@/types';

const nodeTypes = {
  serviceTile: ServiceTile,
};

const edgeTypes = {
  conduitEdge: ConduitEdge,
};

export function FlowCanvas() {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
  } = useGameStore();

  const rfInstance = useRef<ReactFlowInstance<Node<ServiceNodeData>, Edge> | null>(null);

  const onInit = useCallback((instance: ReactFlowInstance<Node<ServiceNodeData>, Edge>) => {
    rfInstance.current = instance;
  }, []);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/cloudcraft') as ServiceType;
      if (!type || !rfInstance.current) return;

      const position = rfInstance.current.screenToFlowPosition({
        x: event.clientX - 55,  // offset to center the tile under cursor
        y: event.clientY - 55,
      });

      addNode(type, position);
    },
    [addNode]
  );

  return (
    <div className="w-full h-full iso-grid canvas-container">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={onInit}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.3}
        maxZoom={2.5}
        defaultEdgeOptions={{ type: 'conduitEdge', animated: false }}
        style={{ background: 'transparent' }}
        proOptions={{ hideAttribution: true }}
        deleteKeyCode={['Backspace', 'Delete']}
      >
        {/* Teal dots matching the high-tech workbench theme */}
        <Background
          variant={BackgroundVariant.Dots}
          gap={40}
          size={1.2}
          color="#14B8A6"
          style={{ opacity: 0.18 }}
        />
        <Controls showInteractive={false} />
        <MiniMap
          nodeColor={(node) => {
            const type = (node.data as ServiceNodeData)?.type;
            const catMap: Record<string, string> = {
              client: '#6366F1',
              cdn: '#06B6D4',
              apiGateway: '#06B6D4',
              loadBalancer: '#8B5CF6',
              computeInstance: '#14B8A6',
              autoScalingGroup: '#14B8A6',
              serverless: '#14B8A6',
              cache: '#3B82F6',
              sqlPrimary: '#3B82F6',
              sqlReplica: '#3B82F6',
              nosqlDb: '#3B82F6',
              objectStorage: '#3B82F6',
              messageQueue: '#D946EF',
              worker: '#D946EF',
            };
            return catMap[type ?? ''] ?? '#94A3B8';
          }}
          maskColor="rgba(27, 31, 46, 0.75)"
        />
      </ReactFlow>
    </div>
  );
}
