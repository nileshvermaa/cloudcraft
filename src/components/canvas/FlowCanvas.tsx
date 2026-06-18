'use client';

import { useCallback, useRef } from 'react';
import {
  ReactFlow,
  Controls,
  MiniMap,
  type ReactFlowInstance,
  type Node,
  type Edge,
} from '@xyflow/react';
import { useGameStore } from '@/store/useGameStore';
import { ServiceTile } from './nodes/ServiceTile';
import { ConduitEdge } from './edges/ConduitEdge';
import { CATALOG, CATEGORY_COLOR } from '@/lib/catalog';
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
        x: event.clientX - 55,
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
        <Controls showInteractive={false} />
        <MiniMap
          pannable
          zoomable
          nodeColor={(node) => {
            const type = (node.data as ServiceNodeData)?.type as ServiceType | undefined;
            const cat = type ? CATALOG[type]?.category : undefined;
            return cat ? CATEGORY_COLOR[cat] : '#C9BFA6';
          }}
          nodeStrokeWidth={0}
          maskColor="rgba(255, 247, 237, 0.6)"
        />
      </ReactFlow>
    </div>
  );
}
