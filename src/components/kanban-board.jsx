import { useState, useEffect } from 'react';

// Importing assets for priorities and statuses
import ThreeDotMenu from '../assets/icons_FEtask/3 dot menu.svg';
import Display from '../assets/icons_FEtask/Display.svg';
import Down from '../assets/icons_FEtask/down.svg';
import AddTask from '../assets/icons_FEtask/add.svg';

import BackLog from '../assets/icons_FEtask/Backlog.svg';
import Todo from '../assets/icons_FEtask/To-do.svg';
import InProgress from '../assets/icons_FEtask/in-progress.svg';
import Done from '../assets/icons_FEtask/Done.svg';
import Cancelled from '../assets/icons_FEtask/Cancelled.svg';

import HighPriority from '../assets/icons_FEtask/Img - High Priority.svg';
import MediumPriority from '../assets/icons_FEtask/Img - Medium Priority.svg';
import LowPriority from '../assets/icons_FEtask/Img - Low Priority.svg';
import NoPriority from '../assets/icons_FEtask/No-priority.svg';
import UrgentColor from '../assets/icons_FEtask/SVG - Urgent Priority colour.svg';

// Labels and icons for priority
const PriorityLabels = {
    4: 'Urgent',
    3: 'High',
    2: 'Medium',
    1: 'Low',
  0: 'No Priority',
};

const PriorityIcons = {
    4: <img src={UrgentColor} alt="Urgent Priority" />,
    3: <img src={HighPriority} alt="High Priority" />,
    2: <img src={MediumPriority} alt="Medium Priority" />,
    1: <img src={LowPriority} alt="Low Priority" />,
    0: <img src={NoPriority} alt="No Priority" />,
};

// Labels and icons for status
const StatusIcons = {
  Backlog: <img src={BackLog} alt="Backlog" />,
  Todo: <img src={Todo} alt="Todo" />,
  'In progress': <img src={InProgress} alt="In Progress" />,
  Done: <img src={Done} alt="Done" />,
  Cancelled: <img src={Cancelled} alt="Cancelled" />,
};

const DisplayButton = ({ grouping, ordering, onGroupingChange, onOrderingChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="dropdown">
      <button onClick={() => setIsOpen(!isOpen)} className="dropdown-btn">
        <img src={Display} alt="display-icon" />
        Display
        <img src={Down} alt="display-toggle" />
      </button>

      {isOpen && (
        <div className="dropdown-menu">
          <div className="dropdown-item">
            <span>Grouping</span>
            <select
              value={grouping}
              onChange={(e) => onGroupingChange(e.target.value)}
              className="dropdown-select"
            >
              <option value="status">Status</option>
              <option value="user">User</option>
              <option value="priority">Priority</option>
            </select>
          </div>
          <div className="dropdown-item">
            <span>Ordering</span>
            <select
              value={ordering}
              onChange={(e) => onOrderingChange(e.target.value)}
              className="dropdown-select"
            >
              <option value="priority">Priority</option>
              <option value="title">Title</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

const Card = ({ ticket, grouping }) => {
  return (
    <div className="card">
      <div className="card-header">
        <span className="card-id">{ticket.id}</span>
        <div className="card-user">👤</div>
      </div>
      <div className="card-body">
        {grouping !== 'status' && (
          <span className="card-status">{StatusIcons[ticket.status]}</span>
        )}
        <h3 className="card-title">{ticket.title}</h3>
      </div>
      <div className="card-footer">
        {grouping !== 'priority' && (
          <div className="card-priority">{PriorityIcons[ticket.priority]}</div>
        )}
        <div className="card-tags">{ticket.tag.join(', ')}</div>
      </div>
    </div>
  );
};

const KanbanColumn = ({ title, tickets, priority, status, grouping }) => {
  const icon = priority !== undefined ? PriorityIcons[priority] : StatusIcons[status];

  return (
    <div className="kanban-column">
      <div className="kanban-column-header">
        <div className="kanban-column-header-left">
          {icon && <img src={icon.props.src} alt={icon.props.alt} />}
          <h2>{title}</h2>
          <span className="ticket-count">{tickets.length}</span>
        </div>
        <div className="kanban-column-header-right">
          <img src={AddTask} alt="menu" />
          <img src={ThreeDotMenu} alt="menu" />
        </div>
      </div>
      <div className="kanban-column-body">
        {tickets.map((ticket) => (
          <Card key={ticket.id} ticket={ticket} grouping={grouping} />
        ))}
      </div>
    </div>
  );
};

const KanbanBoard = () => {
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [grouping, setGrouping] = useState(localStorage.getItem('grouping') || 'status');
  const [ordering, setOrdering] = useState(localStorage.getItem('ordering') || 'priority');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          'https://api.quicksell.co/v1/internal/frontend-assignment'
        );
        const data = await response.json();
        setTickets(data.tickets);
        setUsers(data.users);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    localStorage.setItem('grouping', grouping);
    localStorage.setItem('ordering', ordering);
  }, [grouping, ordering]);

  const sortTickets = (tickets) => {
    return [...tickets].sort((a, b) => {
      if (ordering === 'priority') {
        return b.priority - a.priority;
      }
      return a.title.localeCompare(b.title);
    });
  };

  const groupTickets = () => {
    const sortedTickets = sortTickets(tickets);

    if (grouping === 'priority') {
      const groups = {};
      sortedTickets.forEach((ticket) => {
        const priority = PriorityLabels[ticket.priority];
        if (!groups[priority]) {
          groups[priority] = { tickets: [], priority: ticket.priority };
        }
        groups[priority].tickets.push(ticket);
      });
      return groups;
    }

    if (grouping === 'status') {
      const groups = {};
      sortedTickets.forEach((ticket) => {
        if (!groups[ticket.status]) {
          groups[ticket.status] = { tickets: [], status: ticket.status };
        }
        groups[ticket.status].tickets.push(ticket);
      });
      return groups;
    }

    if (grouping === 'user') {
      const groups = {};
      sortedTickets.forEach((ticket) => {
        const user = users.find((u) => u.id === ticket.userId);
        const userName = user ? user.name : 'Unassigned';
        if (!groups[userName]) {
          groups[userName] = { tickets: [] };
        }
        groups[userName].tickets.push(ticket);
      });
      return groups;
    }
  };

  const groupedTickets = groupTickets();

  return (
    <div className="kanban-board">
      <DisplayButton
        grouping={grouping}
        ordering={ordering}
        onGroupingChange={setGrouping}
        onOrderingChange={setOrdering}
      />
      <div className="kanban-columns">
        {groupedTickets &&
          Object.entries(groupedTickets).map(([group, { tickets, priority, status }]) => (
            <KanbanColumn
              key={group}
              title={group}
              tickets={tickets}
              priority={priority}
              status={status}
              grouping={grouping}
            />
          ))}
      </div>
    </div>
  );
};

export default KanbanBoard;
